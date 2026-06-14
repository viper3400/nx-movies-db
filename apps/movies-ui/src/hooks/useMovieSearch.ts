import { useState, useEffect, FormEvent, useRef } from "react";
import { getMovies } from "../app/services/actions";
import { Movie, moviesSearchInitialFilters } from "../interfaces";
import { DeleteMode, MovieSearchFilters } from "@nx-movies-db/shared-ui";
import { PressEvent } from "@heroui/react";

interface UseMovieSearchProps {
  session: { userName: string };
  availableMediaTypes: Array<{ label: string; value: string }>;
  availableGenres: Array<{ label: string; value: string }>;
}

const SEARCH_STATE_KEY = "moviesSearchState";
const RECENT_RANDOM_HISTORY_LIMIT = 100;

// Helper to map IDs to labels
const getNameFromId = (ids: string[], options: Array<{ label: string; value: string }>): string[] =>
  ids
    .map(id => options.find(o => o.value === id)?.label)
    .filter((lbl): lbl is string => Boolean(lbl));

type SearchState = {
  filters: MovieSearchFilters;
  searchText: string;
  recentRandomMovieIds: string[];
};

export const mergeRecentRandomMovieIds = (currentIds: string[], newIds: string[], limit = RECENT_RANDOM_HISTORY_LIMIT) =>
  [...currentIds, ...newIds].reduce<string[]>((acc, id) => {
    const normalizedId = String(id);
    const existingIndex = acc.indexOf(normalizedId);
    if (existingIndex !== -1) {
      acc.splice(existingIndex, 1);
    }
    acc.push(normalizedId);
    return acc.slice(-limit);
  }, []);

export function useMovieSearch({
  session,
  availableMediaTypes,
  availableGenres,
}: UseMovieSearchProps) {
  // Helpers for robust equality and normalization
  const sameSet = (a: string[] = [], b: string[] = []) => {
    if (a.length !== b.length) return false;
    const aa = [...a].sort();
    const bb = [...b].sort();
    return aa.every((v, i) => v === bb[i]);
  };

  const equalFilters = (a: MovieSearchFilters, b: MovieSearchFilters) =>
    a.deleteMode === b.deleteMode &&
    a.tvSeriesMode === b.tvSeriesMode &&
    a.filterForFavorites === b.filterForFavorites &&
    a.filterForWatchAgain === b.filterForWatchAgain &&
    sameSet(a.filterForMediaTypes, b.filterForMediaTypes) &&
    sameSet(a.filterForGenres, b.filterForGenres) &&
    a.randomExcludeDeleted === b.randomExcludeDeleted;

  const normalizeFilters = (f: MovieSearchFilters): MovieSearchFilters => ({
    ...f,
    // sort for stable comparisons and persistence
    filterForMediaTypes: [...(f.filterForMediaTypes ?? [])].sort(),
    filterForGenres: [...(f.filterForGenres ?? [])].sort(),
  });
  // Restore filters & searchText from localStorage on first render
  const [searchState, setSearchState] = useState<SearchState>(() => {
    const stored = localStorage.getItem(SEARCH_STATE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const merged: MovieSearchFilters = { ...moviesSearchInitialFilters, ...parsed.filters };
        return {
          filters: normalizeFilters(merged),
          searchText: parsed.searchText ?? "",
          recentRandomMovieIds: Array.isArray(parsed.recentRandomMovieIds)
            ? parsed.recentRandomMovieIds.map((id: string | number) => String(id))
            : [],
        };
      } catch {
        // ignore
      }
    }
    return { filters: normalizeFilters(moviesSearchInitialFilters), searchText: "", recentRandomMovieIds: [] };
  });

  const { filters, searchText, recentRandomMovieIds } = searchState;
  const [searchResult, setSearchResult] = useState<Movie[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isDefaultFilter, setIsDefaultFilter] = useState<boolean>(true);
  const [totalMoviesCount, setTotalMoviesCount] = useState<number>(0);
  const currentPageRef = useRef<number | null>(null);
  const nextPageRef = useRef<number>(1);
  const loadingRef = useRef(false);
  const randomSearchRef = useRef(false);

  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [nextPage, setNextPage] = useState<number>(1);

  // Keep refs in sync with state
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
  useEffect(() => {
    nextPageRef.current = nextPage;
  }, [nextPage]);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // Persist searchState whenever it changes
  useEffect(() => {
    localStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(searchState));
  }, [searchState]);

  // Compute if filters match initial defaults (order-insensitive)
  useEffect(() => {
    setIsDefaultFilter(equalFilters(filters, moviesSearchInitialFilters));
  }, [filters]);

  useEffect(() => {
    if (randomSearchRef.current === true) {
      randomSearchRef.current = false;
      clearSearchResult();
    }
    else if (searchText.trim() !== "" || searchResult) {
      clearSearchResult();
      executeSearch(0, searchText);
    }

  }, [filters]);

  // Form submit handler: always search, even if searchText is empty
  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    randomSearchRef.current = false;
    clearSearchResult();
    await executeSearch(0, searchText.trim());
  };

  const handleRandomSearchRequest = async (e: PressEvent) => {
    setSearchState(prev => ({ ...prev, searchText: "" }));
    clearSearchResult();
    randomSearchRef.current = true;
    await executeSearch(0, "");
  };

  // Pagination trigger
  const handleNextPageTrigger: () => void = () => {
    // Only allow loading the next page in sequence, and only if a search has been performed
    if (
      currentPage !== null &&
      !loading &&
      searchResult &&
      searchResult.length > 0 &&
      nextPage === currentPage + 1 &&
      totalMoviesCount > searchResult.length
    ) {
      executeSearch(nextPage, searchText);
    }
  };

  // Clear search results and reset pagination
  const clearSearchResult = () => {
    setSearchResult(undefined);
    setCurrentPage(null);
    setNextPage(1);
    setTotalMoviesCount(0);
  };

  // Core search execution
  const executeSearch = async (page: number, customSearchText?: string) => {
    setLoading(true);
    try {
      const query = customSearchText ?? searchText;

      const deleteModeForRequest: DeleteMode =
        randomSearchRef.current && filters.randomExcludeDeleted
          ? "EXCLUDE_DELETED" // user opted to keep deleted titles out of random picks
          : filters.deleteMode;

      const data = await getMovies(
        query,
        deleteModeForRequest,
        filters.tvSeriesMode,
        filters.filterForFavorites,
        filters.filterForWatchAgain,
        randomSearchRef.current,
        getNameFromId(filters.filterForMediaTypes, availableMediaTypes),
        getNameFromId(filters.filterForGenres, availableGenres),
        randomSearchRef.current ? recentRandomMovieIds : [],
        session.userName,
        10,
        page * 10
      );

      const list = data?.videos?.videos ?? [];
      const total = data?.videos?.requestMeta?.totalCount ?? 0;
      setTotalMoviesCount(total);

      if (page === 0) {
        setSearchResult(list);
        setCurrentPage(0);
        setNextPage(list.length < total ? 1 : 0);
        if (randomSearchRef.current && list.length > 0) {
          setSearchState(prev => ({
            ...prev,
            recentRandomMovieIds: mergeRecentRandomMovieIds(
              prev.recentRandomMovieIds,
              list.map(movie => movie.id),
            ),
          }));
        }
      } else if (currentPage !== null && page === currentPage + 1) {
        setSearchResult((prev) => (prev ? [...prev, ...list] : list));
        setCurrentPage(page);
        setNextPage((page + 1) * 10 < total ? page + 1 : page);
      }
    } finally {
      setLoading(false);
    }
  };

  // Setters for searchText and filters that update the combined state
  const setSearchText = (text: string) =>
    setSearchState(prev => ({ ...prev, searchText: text }));

  const setFilters = (f: MovieSearchFilters) =>
    setSearchState(prev => ({ ...prev, filters: normalizeFilters(f) }));

  return {
    searchText,
    setSearchText,
    invalidSearch: false, // No validation needed
    searchResult,
    loading,
    validateSearch: () => true, // No validation needed
    totalMoviesCount,
    filters,
    setFilters,
    isDefaultFilter,
    handleSearchSubmit,
    handleRandomSearchRequest,
    clearSearchResult,
    handleNextPageTrigger,
  };
}

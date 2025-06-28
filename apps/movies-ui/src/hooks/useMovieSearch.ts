import { useState, useEffect, FormEvent, useRef } from "react";
import { getMovies } from "../app/services/actions";
import { Movie, moviesSearchInitialFilters } from "../interfaces";
import { MovieSearchFilters } from "@nx-movies-db/shared-ui";

interface UseMovieSearchProps {
  session: { userName: string };
  availableMediaTypes: any[];
  availableGenres: any[];
}

const SEARCH_STATE_KEY = "moviesSearchState";

// Helper to map IDs to labels
const getNameFromId = (ids: string[], options: any[]): string[] =>
  ids
    .map(id => options.find(o => o.value === id)?.label)
    .filter((lbl): lbl is string => Boolean(lbl));

type SearchState = {
  filters: MovieSearchFilters;
  searchText: string;
};

export function useMovieSearch({
  session,
  availableMediaTypes,
  availableGenres,
}: UseMovieSearchProps) {
  // Restore filters & searchText from localStorage on first render
  const [searchState, setSearchState] = useState<SearchState>(() => {
    const stored = localStorage.getItem(SEARCH_STATE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          filters: { ...moviesSearchInitialFilters, ...parsed.filters },
          searchText: parsed.searchText ?? "",
        };
      } catch {
        // ignore
      }
    }
    return { filters: moviesSearchInitialFilters, searchText: "" };
  });

  const { filters, searchText } = searchState;
  const [searchResult, setSearchResult] = useState<Movie[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isDefaultFilter, setIsDefaultFilter] = useState<boolean>(true);
  const [totalMoviesCount, setTotalMoviesCount] = useState<number>(0);
  const currentPageRef = useRef<number | null>(null);
  const nextPageRef = useRef<number>(1);
  const loadingRef = useRef(false);

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

  // Compute if filters match initial defaults
  useEffect(() => {
    setIsDefaultFilter(
      JSON.stringify(filters) === JSON.stringify(moviesSearchInitialFilters)
    );
  }, [filters]);

  // Only run search on filter change if searchText is NOT empty
  useEffect(() => {
    if (searchText.trim() !== "") {
      clearSearchResult();
      executeSearch(0, searchText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Form submit handler: always search, even if searchText is empty
  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearSearchResult();
    await executeSearch(0, searchText.trim());
  };

  // Pagination trigger
  const handleNextPageTrigger = () => {
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
    const query = customSearchText ?? searchText;

    const result = await getMovies(
      query,
      filters.deleteMode,
      filters.tvSeriesMode,
      filters.filterForFavorites,
      filters.filterForWatchAgain,
      filters.filterForRandomMovies,
      getNameFromId(filters.filterForMediaTypes, availableMediaTypes),
      getNameFromId(filters.filterForGenres, availableGenres),
      session.userName,
      10,
      page * 10
    );

    const total = result.videos.requestMeta.totalCount;
    setTotalMoviesCount(total);

    if (page === 0) {
      setSearchResult(result.videos.videos);
      setCurrentPage(0);
      setNextPage(result.videos.videos.length < total ? 1 : 0);
    } else if (currentPage !== null && page === currentPage + 1) {
      setSearchResult((prev) => prev ? [...prev, ...result.videos.videos] : result.videos.videos);
      setCurrentPage(page);
      setNextPage((page + 1) * 10 < total ? page + 1 : page);
    }
    setLoading(false);
  };

  // Setters for searchText and filters that update the combined state
  const setSearchText = (text: string) =>
    setSearchState(prev => ({ ...prev, searchText: text }));

  const setFilters = (f: MovieSearchFilters) =>
    setSearchState(prev => ({ ...prev, filters: f }));

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
    clearSearchResult,
    handleNextPageTrigger,
  };
}

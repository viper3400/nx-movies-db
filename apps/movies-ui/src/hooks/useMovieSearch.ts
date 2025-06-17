import { useState, useEffect, useRef, FormEvent } from "react";
import { getMovies } from "../app/services/actions";
import { Movie } from "../interfaces";

interface UseMovieSearchProps {
  session: { userName: string };
  availableMediaTypes: any[];
  availableGenres: any[];
}

const SEARCH_TERM_KEY = "moviesSearchTerm";
const FILTERS_KEY = "moviesFilters";

export function useMovieSearch({
  session,
  availableMediaTypes,
  availableGenres,
}: UseMovieSearchProps) {
  // All your search/pagination/filter state moves here
  const initialDeleteMode = "INCLUDE_DELETED";
  const initialFilterForFavorites = false;
  const initialFilterForWatchAgain = false;
  const initialTvSeriesMode = "INCLUDE_TVSERIES";
  const initialFilterForRandomMovies = false;
  const initialFilterForMediaTypes: string[] = [];
  const initialFilterForGenres: string[] = [];

  const [searchText, setSearchText] = useState<string>("");
  const [invalidSearch, setInvalidSearch] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Movie[]>();
  const [loading, setLoading] = useState<boolean>(false);

  const [deleteMode, setDeleteMode] = useState<string>(initialDeleteMode);
  const [filterForFavorites, setFilterForFavorites] = useState(initialFilterForFavorites);
  const [filterForWatchAgain, setFilterForWatchAgain] = useState(initialFilterForWatchAgain);
  const [tvSeriesMode, setTvSeriesMode] = useState(initialTvSeriesMode);
  const [filterForRandomMovies, setFilterForRandomMovies] = useState(initialFilterForRandomMovies);
  const [filterForMediaTypes, setFilterForMediaTypes] = useState(initialFilterForMediaTypes);
  const [isDefaultFilter, setIsDefaultFilter] = useState(true);
  const [totalMoviesCount, setTotalMoviesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>();
  const [nextPage, setNextPage] = useState<number>();
  const [filterForGenres, setFilterForGenres] = useState(initialFilterForGenres);

  const [restoring, setRestoring] = useState(true); // Add this line

  const invalidTextLength = (text: string) => text.length < 0;

  // Helper
  const getNameFromId = (ids: string[], searchArray: any): string[] => {
    if (!searchArray) return [];
    return ids
      .map(id => {
        const mt = searchArray.find((mt: any) => mt.value === id);
        return mt ? mt.label : undefined;
      })
      .filter((label): label is string => typeof label === "string");
  };

  useEffect(() => {
    invalidSearch ?? clearSearchResult();
  }, [invalidSearch]);

  useEffect(() => {
    if (searchResult) {
      if (invalidTextLength(searchText)) {
        validateSearch(searchText);
      }
      else {
        clearSearchResult();
        executeSearch(0);
      }
    }
  }, [deleteMode, filterForFavorites, filterForWatchAgain, tvSeriesMode, filterForRandomMovies, filterForMediaTypes]); // Run on changes

  useEffect(() => {
    const isDefault =
      deleteMode === initialDeleteMode &&
      filterForFavorites === initialFilterForFavorites &&
      filterForWatchAgain === initialFilterForWatchAgain &&
      tvSeriesMode === initialTvSeriesMode &&
      filterForRandomMovies === initialFilterForRandomMovies &&
      filterForMediaTypes.length === initialFilterForMediaTypes.length &&
      filterForMediaTypes.every((val) => initialFilterForMediaTypes.includes(val)) &&
      initialFilterForMediaTypes.every((val) => filterForMediaTypes.includes(val)) &&

      filterForGenres.length === initialFilterForGenres.length &&
      filterForGenres.every((val) => initialFilterForGenres.includes(val)) &&
      initialFilterForGenres.every((val) => initialFilterForGenres.includes(val));
    setIsDefaultFilter(isDefault);
  }, [
    deleteMode,
    filterForFavorites,
    filterForWatchAgain,
    tvSeriesMode,
    filterForRandomMovies,
    filterForMediaTypes,
    filterForGenres
  ]);

  useEffect(() => {
    // Restore filters
    const storedFilters = sessionStorage.getItem(FILTERS_KEY);
    if (storedFilters) {
      try {
        const filters = JSON.parse(storedFilters);
        if (filters.deleteMode) setDeleteMode(filters.deleteMode);
        if (typeof filters.filterForFavorites === "boolean") setFilterForFavorites(filters.filterForFavorites);
        if (typeof filters.filterForWatchAgain === "boolean") setFilterForWatchAgain(filters.filterForWatchAgain);
        if (filters.tvSeriesMode) setTvSeriesMode(filters.tvSeriesMode);
        if (typeof filters.filterForRandomMovies === "boolean") setFilterForRandomMovies(filters.filterForRandomMovies);
        if (Array.isArray(filters.filterForMediaTypes)) setFilterForMediaTypes(filters.filterForMediaTypes);
        if (Array.isArray(filters.filterForGenres)) setFilterForGenres(filters.filterForGenres);
      } catch { throw new Error("Error on restore filters."); }
    }
    // Restore search term
    const stored = sessionStorage.getItem(SEARCH_TERM_KEY);
    if (stored) {
      setSearchText(stored);
    }
    setRestoring(false); // Restoration done

  }, []);

  // Initial search effect: only runs once, after restoration is done
  const initialSearchDone = useRef(false);
  useEffect(() => {
    if (restoring || initialSearchDone.current) return;
    const stored = sessionStorage.getItem(SEARCH_TERM_KEY);
    if (stored) {
      executeSearch(0, stored);
      initialSearchDone.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoring, deleteMode, filterForFavorites, filterForWatchAgain, tvSeriesMode, filterForRandomMovies, filterForMediaTypes, filterForGenres]);

  const validateSearch = (text: string) => {
    setInvalidSearch(invalidTextLength(text));
  };

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    validateSearch(searchText);
    if (!invalidTextLength(searchText)) {
      await clearSearchResult();
      executeSearch(0);
    }
  };

  const handleNextPageTrigger = () => {
    if (!loading && nextPage !== undefined && currentPage !== undefined && nextPage > currentPage) {
      executeSearch(nextPage);
    }
  };

  const clearSearchResult = async () => {
    sessionStorage.removeItem(SEARCH_TERM_KEY);
    setLoading(true);
    setSearchResult(undefined);
    setCurrentPage(undefined);
    setNextPage(undefined);
    setTotalMoviesCount(0);
    setLoading(false);
  };

  const executeSearch = async (page: number, customSearchText?: string) => {
    setLoading(true);
    const effectiveSearchText = customSearchText !== undefined ? customSearchText : searchText;
    // Store searchText in session storage whenever a search is executed
    if (effectiveSearchText) {
      sessionStorage.setItem(SEARCH_TERM_KEY, effectiveSearchText);
    }
    const result =
      await getMovies(
        effectiveSearchText,
        deleteMode,
        tvSeriesMode,
        filterForFavorites,
        filterForWatchAgain,
        filterForRandomMovies,
        getNameFromId(filterForMediaTypes, availableMediaTypes),
        getNameFromId(filterForGenres, availableGenres),
        session.userName,
        10,
        page * 10
      );
    const resultCount = result.videos.requestMeta.totalCount;
    setTotalMoviesCount(resultCount);
    setSearchResult((prev) => prev ? [...prev, ...result.videos.videos] : result.videos.videos);
    setCurrentPage(page);
    if ((page + 1) * 10 < resultCount) {
      setNextPage((prev) => prev ? prev + 1 : 1);
    } else {
      setNextPage(page);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (restoring) return; // <-- Prevent persisting during restoration
    const filters = {
      deleteMode,
      filterForFavorites,
      filterForWatchAgain,
      tvSeriesMode,
      filterForRandomMovies,
      filterForMediaTypes,
      filterForGenres,
    };
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [
    restoring, // <-- Add restoring as a dependency
    deleteMode,
    filterForFavorites,
    filterForWatchAgain,
    tvSeriesMode,
    filterForRandomMovies,
    filterForMediaTypes,
    filterForGenres,
  ]);

  return {
    // State and actions your component needs:
    searchText, setSearchText,
    invalidSearch,
    searchResult,
    loading,
    validateSearch,
    totalMoviesCount,
    deleteMode, setDeleteMode,
    filterForFavorites, setFilterForFavorites,
    filterForWatchAgain, setFilterForWatchAgain,
    tvSeriesMode, setTvSeriesMode,
    filterForRandomMovies, setFilterForRandomMovies,
    filterForMediaTypes, setFilterForMediaTypes,
    filterForGenres, setFilterForGenres,
    isDefaultFilter,
    handleSearchSubmit,
    clearSearchResult,
    handleNextPageTrigger,
  };
}

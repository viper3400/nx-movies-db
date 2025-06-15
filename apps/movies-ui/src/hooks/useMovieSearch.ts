import { useState, useEffect, FormEvent } from "react";
import { getMovies } from "../app/services/actions";
import { Movie } from "../interfaces";

interface UseMovieSearchProps {
  session: { userName: string };
  availableMediaTypes: any[];
  availableGenres: any[];
}

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
    setLoading(true);
    setSearchResult(undefined);
    setCurrentPage(undefined);
    setNextPage(undefined);
    setTotalMoviesCount(0);
    setLoading(false);
  };

  const executeSearch = async (page: number) => {
    setLoading(true);
    const result =
      await getMovies(
        searchText,
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

"use client";

import { useEffect, useState, FormEvent } from "react";

import { MovieCardDeck } from "./movie-card-deck";

import { getMovies, getSeenDates, updateUserFlags } from "../app/services/actions";
import { getAppBasePath } from "../app/services/actions/getAppBasePath";
import { getUserFlagsForMovie } from "../app/services/actions/getUserFlags";
import { Movie, MoviesDbSession, UserFlagsDTO } from "../interfaces";
import SearchForm from "./search-form";
import PageEndObserver from "./page-end-observer";
import useTranslation from "../i18n/useTranslation";

interface MovieComponentProperties {
  session: MoviesDbSession;
}

// Main component that handles user input and renders Data component
export const MovieComponent = ({ session }: MovieComponentProperties) => {
  const [searchText, setSearchText] = useState<string>("");
  const [invalidSearch, setInvalidSearch] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Movie[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [imageBaseUrl, setImageBaseUrl] = useState<string>();
  const [appBasePath, setAppBasePath] = useState<string>();
  const [deleteMode, setDeleteMode] = useState<string>("INCLUDE_DELETED");
  const [totalMoviesCount, setTotalMoviesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>();
  const [nextPage, setNextPage] = useState<number>();
  const [filterForFavorites, setFilterForFavorites] = useState(false);
  const [filterForWatchAgain, setFilterForWatchAgain] = useState(false);

  const invalidTextLength = (text: string) => text.length < 0;
  const { t, lang, changeLanguage } = useTranslation();

  const loadSeenDatesForMovie = async (movieId: string) => {
    const seenDates = await getSeenDates(movieId, "VG_Default");
    return seenDates;
  };

  const loadUserFlagsForMovie = async (movieId: string) => {
    const flags = await getUserFlagsForMovie(movieId, session.userName);
    return flags;
  };

  const updateUserFlagsForMovie = async (flags: UserFlagsDTO) => {
    await updateUserFlags(
      parseInt(flags.movieId),
      flags.isFavorite,
      flags.isWatchAgain,
      session.userName);
  };

  useEffect(() => {
    const fetchAppBasePath = async () => {
      setAppBasePath(await getAppBasePath());
      setImageBaseUrl(appBasePath + "/api/cover-image");
    };
    fetchAppBasePath();
  });

  useEffect(() => {
    invalidSearch ?? clearSearchResult();
  }, [invalidSearch]);


  // New useEffect to retrigger search when deleteMode changes
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
  }, [deleteMode]); // Run when `deleteMode` changes

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

    setLoading(false);
  };

  const executeSearch = async (page: number) => {
    setLoading(true);
    const result =
      await getMovies(searchText, deleteMode, filterForFavorites, filterForWatchAgain, session.userName, 10, page * 10);
    const resultCount = result.videos.requestMeta.totalCount;
    setTotalMoviesCount(resultCount);
    setSearchResult((prev) => prev ? [...prev, ...result.videos.videos] : result.videos.videos); // Triggers `useEffect`
    setCurrentPage(page);
    if ((page + 1) * 10 < resultCount) {
      setNextPage((prev) => prev ? prev + 1 : 1);
    } else {
      setNextPage(page);
    }
    setLoading(false);
  };

  return (
    <div>
      <SearchForm
        searchText={searchText}
        setSearchText={setSearchText}
        invalidSearch={invalidSearch}
        validateSearch={validateSearch}
        clearSearchResult={clearSearchResult}
        totalMoviesCount={totalMoviesCount}
        deleteMode={deleteMode}
        setDeleteMode={setDeleteMode}
        filterForFavorites={filterForFavorites}
        setFilterForFavorites={() => setFilterForFavorites(!filterForFavorites)}
        filterForWatchAgain={filterForWatchAgain}
        setFilterForWatchAgain={() => setFilterForWatchAgain(!filterForWatchAgain)}
        handleSearchSubmit={handleSearchSubmit}
        langResources={{
          placeholderLabel: t.search?.placeholder,
          searchLabel: t.search?.search,
          resultCountLabel: t.search?.result_count,
          deletedMoviesFilterLabel: t.search?.deletedMoviesFilterLabel,
          deletedMoviesFilterExcludeDeleted: t.search?.deletedMoviesFilterExcludeDeleted,
          deletedMoviesFilterIncludeDeleted: t.search?.deletedMoviesFilterIncludeDeleted,
          deletedMoviesFilterOnlyDeleted: t.search?.deletedMoviesFilterOnlyDeleted,
          favoriteMoviesFilterLabel: t.search?.favoriteMoviesFilterLabel,
          watchagainMoviesFilterLabel: t.search?.watchagainMoviesFilterLabel
        }} />
      <div className="space-y-4">
        {loading && <div>{t.common?.loading} ...</div>}
        {searchResult && imageBaseUrl && (
          <MovieCardDeck
            movies={searchResult}
            loadUserFlagsForMovie={loadUserFlagsForMovie}
            imageBaseUrl={imageBaseUrl}
            appBasePath={appBasePath}
            loadSeenDatesForMovie={loadSeenDatesForMovie}
            updateFlagsForMovie={updateUserFlagsForMovie}
          />
        )}
      </div>
      <PageEndObserver onIntersect={handleNextPageTrigger} />
    </div>
  );
};

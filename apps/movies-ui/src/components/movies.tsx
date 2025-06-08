"use client";

import { useEffect, useState, FormEvent } from "react";

import { MovieCardDeck, ResultsStatusIndicator } from "@nx-movies-db/shared-ui";

import { deleteUserSeenDate, getMediaTypes, getMovies, getSeenDates, setUserSeenDate, updateUserFlags } from "../app/services/actions";
import { getAppBasePath } from "../app/services/actions/getAppBasePath";
import { getUserFlagsForMovie } from "../app/services/actions/getUserFlags";
import { Movie, MoviesDbSession, UserFlagsDTO } from "../interfaces";
import SearchForm from "./search-form";
import PageEndObserver from "./page-end-observer";
import { useTranslation } from "react-i18next";

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
  const initialDeleteMode = "INCLUDE_DELETED";
  const initialFilterForFavorites = false;
  const initialFilterForWatchAgain = false;
  const initialTvSeriesMode = "INCLUDE_TVSERIES";
  const initialFilterForRandomMovies = false;
  const initialFilterForMediaTypes: string[] = [];

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
  const [availableMediaTypes, setAvailableMediaTypes] = useState<{ label: string; value: string }[]>();

  const invalidTextLength = (text: string) => text.length < 0;
  const { t } = useTranslation();

  const loadSeenDatesForMovie = async (movieId: string) => {
    const seenDates = await getSeenDates(movieId, "VG_Default");
    return seenDates;
  };

  const getMediaTypeNameFromIds = (ids: string[]): string[] => {
    if (!availableMediaTypes) return [];
    return ids
      .map(id => {
        const mt = availableMediaTypes.find((mt: any) => mt.value === id);
        return mt ? mt.label : undefined;
      })
      .filter((label): label is string => typeof label === "string");
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

  const setUserSeenDateForMovie = async (movieId: string, date: Date) => {
    await setUserSeenDate(
      parseInt(movieId),
      session.userName,
      date.toISOString().slice(0, 10),
      "VG_Default");
  };

  const deleteUserSeenDateForMovie = async (movieId: string, date: Date) => {
    await deleteUserSeenDate(
      parseInt(movieId),
      date.toISOString().slice(0, 10),
      "VG_Default");
  };

  useEffect(() => {
    const fetchAppBasePath = async () => {
      setAppBasePath(await getAppBasePath());
      setImageBaseUrl(appBasePath + "/api/cover-image");
    };
    fetchAppBasePath();
  });

  useEffect(() => {
    const fetchMediaTypes = async () => {
      const data = await getMediaTypes();
      setAvailableMediaTypes(
        data.mediaTypes.map((mt: any) => ({
          label: mt.name,
          value: String(mt.id),
        }))
      );
    };
    fetchMediaTypes();
  }, []);

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
      initialFilterForMediaTypes.every((val) => filterForMediaTypes.includes(val));
    setIsDefaultFilter(isDefault);
  }, [deleteMode, filterForFavorites, filterForWatchAgain, tvSeriesMode, filterForRandomMovies, filterForMediaTypes]);

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
      await getMovies(searchText, deleteMode, tvSeriesMode, filterForFavorites, filterForWatchAgain, filterForRandomMovies, getMediaTypeNameFromIds(filterForMediaTypes), session.userName, 10, page * 10);
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
        setFilterForFavorites={setFilterForFavorites}
        filterForWatchAgain={filterForWatchAgain}
        setFilterForWatchAgain={setFilterForWatchAgain}
        randomOrder={filterForRandomMovies}
        setRandomOrder={setFilterForRandomMovies}
        tvSeriesMode={tvSeriesMode}
        setTvSeriesMode={setTvSeriesMode}
        mediaTypes={availableMediaTypes ?? []}
        filterForMediaTypes={filterForMediaTypes}
        setFilterForMediaTypes={setFilterForMediaTypes}
        handleSearchSubmit={handleSearchSubmit}
        isDefaultFilter={isDefaultFilter}
        langResources={{
          placeholderLabel: t("search.placeholder"),
          searchLabel: t("search.search"),
          resultCountLabel: t("search.result_count"),
        }} />
      <div>
        {searchResult && imageBaseUrl && (
          <MovieCardDeck
            movies={searchResult}
            loadUserFlagsForMovie={loadUserFlagsForMovie}
            imageBaseUrl={imageBaseUrl}
            appBasePath={appBasePath}
            loadSeenDatesForMovie={loadSeenDatesForMovie}
            updateFlagsForMovie={updateUserFlagsForMovie}
            setUserSeenDateForMovie={setUserSeenDateForMovie}
            deleteUserSeenDateForMovie={deleteUserSeenDateForMovie}
            movieCardLangResources={{
              seenTodayLabel: t("movie_card.seen_today"),
              chooseDateLabel: t("movie_card.choose_date"),
              deletedEntryLabel: t("movie_card.deleted_entry")
            }}
          />
        )}
      </div>
      <ResultsStatusIndicator isLoading={loading} hasNoResults={searchResult?.length == 0} hasNoMoreResults={searchResult?.length == totalMoviesCount && totalMoviesCount != 0} />
      <PageEndObserver onIntersect={handleNextPageTrigger} />
    </div>
  );
};

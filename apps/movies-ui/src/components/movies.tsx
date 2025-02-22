"use client";

import { useEffect, useState, FormEvent } from "react";

import { MovieCardDeck } from "./movie-card-deck";

import { getMovies, getSeenDates } from "../app/services/actions";
import { getAppBasePath } from "../app/services/actions/getAppBasePath";
import { getUserFlagsForMovie } from "../app/services/actions/getUserFlags";
import { Movie, MoviesDbSession, SeenDateDTO, UserFlagsDTO } from "../interfaces";
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
  const [seenDates, setSeenDates] = useState<SeenDateDTO[]>();
  const [userFlags, setUserFlags] = useState<UserFlagsDTO[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [seenDatesLoading, setSeenDatesLoading] = useState<boolean>(true);
  const [imageBaseUrl, setImageBaseUrl] = useState<string>();
  const [appBasePath, setAppBasePath] = useState<string>();
  const [deleteMode, setDeleteMode] = useState<string>("INCLUDE_DELETED");
  const [totalMoviesCount, setTotalMoviesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>();
  const [nextPage, setNextPage] = useState<number>();

  const invalidTextLength = (text: string) => text.length < 0;
  const { t, lang, changeLanguage } = useTranslation();

  useEffect(() => {
    const fetchAppBasePath = async () => {
      setAppBasePath(await getAppBasePath());
      setImageBaseUrl(appBasePath + "/api/cover-image");
    };
    fetchAppBasePath();
  });

  useEffect(() => {
    if (searchResult) {
      const fetchSeenDates = async () => {
        const seenDateCollection: SeenDateDTO[] = [];
        for (const movie of searchResult) {
          const dates = await getSeenDates(movie.id, "VG_Default");
          seenDateCollection.push({ movieId: movie.id, dates });
        }
        setSeenDates(seenDateCollection);
        setSeenDatesLoading(false);
      };

      const fetchUserFlags = async () => {
        const userFlagCollection: UserFlagsDTO[] = [];
        for (const movie of searchResult) {
          const flags = await getUserFlagsForMovie(movie.id, session.userName);
          if(flags.length > 0) userFlagCollection.push({ movieId: movie.id, isFavorite: flags[0].isFavorite, isWatchAgain: flags[0].isWatchAgain  });
        }
        setUserFlags(userFlagCollection);
      };

      fetchSeenDates();
      fetchUserFlags();
    }
  }, [searchResult]); // Run when `searchResult` changes

  useEffect(() => {
    invalidSearch ?? clearSearchResult();
  }, [invalidSearch]);


  // New useEffect to retrigger search when deleteMode changes
  useEffect(() => {
    if (searchResult) {
      if (invalidTextLength(searchText))  {
        validateSearch(searchText);}
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
    setSeenDates([]);
    setLoading(false);
  };

  const executeSearch = async (page: number) => {
    setLoading(true);
    setSeenDatesLoading(true);
    const result = await getMovies(searchText, deleteMode, 10, page * 10);
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
        handleSearchSubmit={handleSearchSubmit}
        langResources={
          {
            placeholderLabel: t.search?.placeholder,
            searchLabel: t.search?.search,
            resultCountLabel: t.search?.result_count,
            deletedMoviesFilterLabel: t.search?.deletedMoviesFilterLabel,
            deletedMoviesFilterExcludeDeleted: t.search?.deletedMoviesFilterExcludeDeleted,
            deletedMoviesFilterIncludeDeleted: t.search?.deletedMoviesFilterIncludeDeleted,
            deletedMoviesFilterOnlyDeleted: t.search?.deletedMoviesFilterOnlyDeleted,
          }
        }      />
      <div className="space-y-4">
        {loading && <div>Loading ...</div>}
        {searchResult && imageBaseUrl && (
          <MovieCardDeck
            movies={searchResult}
            seenDates={seenDates ? seenDates : []}
            seenDatesLoading={seenDatesLoading}
            userFlags={userFlags ? userFlags : []}
            imageBaseUrl={imageBaseUrl}
            appBasePath={appBasePath}
          />
        )}
      </div>
      <PageEndObserver onIntersect={handleNextPageTrigger} />
    </div>
  );
};

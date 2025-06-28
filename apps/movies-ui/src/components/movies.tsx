"use client";

import { MovieCardDeck, ResultsStatusIndicator, SearchForm } from "@nx-movies-db/shared-ui";
import { MoviesDbSession } from "../interfaces";
import PageEndObserver from "./page-end-observer";
import { useTranslation } from "react-i18next";
import {
  useAppBasePath,
  useAvailableMediaAndGenres,
  useMovieSearch,
  useSeenDates,
  useUserFlags,
} from "../hooks";

interface MovieComponentProperties {
  session: MoviesDbSession;
}

export const MovieComponent = ({ session }: MovieComponentProperties) => {
  const { availableMediaTypes, availableGenres } = useAvailableMediaAndGenres();
  const { appBasePath, imageBaseUrl } = useAppBasePath();
  const { loadUserFlagsForMovie, updateUserFlagsForMovie } = useUserFlags(session.userName);
  const { loadSeenDatesForMovie, setUserSeenDateForMovie, deleteUserSeenDateForMovie } = useSeenDates(session.userName);
  const {
    searchText,
    setSearchText,
    invalidSearch,
    validateSearch,
    clearSearchResult,
    totalMoviesCount,
    filters,
    setFilters,
    handleSearchSubmit,
    loading,
    searchResult,
    isDefaultFilter,
    handleNextPageTrigger,
  } = useMovieSearch({ session, availableMediaTypes, availableGenres });

  const { t } = useTranslation();

  return (
    <div>
      <SearchForm
        searchText={searchText}
        setSearchText={setSearchText}
        invalidSearch={invalidSearch}
        validateSearch={validateSearch}
        clearSearchResult={clearSearchResult}
        totalMoviesCount={totalMoviesCount}
        filters={filters}
        setFilters={setFilters}
        handleSearchSubmit={handleSearchSubmit}
        isDefaultFilter={isDefaultFilter}
        langResources={{
          placeholderLabel: t("search.placeholder"),
          searchLabel: t("search.search"),
          resultCountLabel: t("search.result_count"),
        }}
        mediaTypes={availableMediaTypes ?? []}
        genres={availableGenres ?? []}
      />

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
              deletedEntryLabel: t("movie_card.deleted_entry"),
            }}
          />
        )}
      </div>

      <ResultsStatusIndicator
        isLoading={loading}
        hasNoResults={searchResult?.length === 0}
        hasNoMoreResults={
          searchResult?.length === totalMoviesCount && totalMoviesCount !== 0
        }
      />

      <PageEndObserver onIntersect={handleNextPageTrigger} />
    </div>
  );
};

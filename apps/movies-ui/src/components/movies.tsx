"use client";

import { MovieCardDeck, ResultsStatusIndicator } from "@nx-movies-db/shared-ui";

import { MoviesDbSession } from "../interfaces";
import SearchForm from "./search-form";
import PageEndObserver from "./page-end-observer";
import { useTranslation } from "react-i18next";
import { useAppBasePath, useAvailableMediaAndGenres, useMovieSearch, useSeenDates, useUserFlags } from "../hooks";

interface MovieComponentProperties {
  session: MoviesDbSession;
}

// Main component that handles user input and renders Data component
export const MovieComponent = ({ session }: MovieComponentProperties) => {
  const { availableMediaTypes, availableGenres } = useAvailableMediaAndGenres();
  const { appBasePath, imageBaseUrl } = useAppBasePath();
  const { loadUserFlagsForMovie, updateUserFlagsForMovie } = useUserFlags(session.userName);
  const { loadSeenDatesForMovie, setUserSeenDateForMovie, deleteUserSeenDateForMovie } = useSeenDates(session.userName);
  const search = useMovieSearch({ session, availableMediaTypes, availableGenres });

  const { t } = useTranslation();

  return (
    <div>
      <SearchForm
        searchText={search.searchText}
        setSearchText={search.setSearchText}
        invalidSearch={search.invalidSearch}
        validateSearch={search.validateSearch}
        clearSearchResult={search.clearSearchResult}
        totalMoviesCount={search.totalMoviesCount}
        deleteMode={search.deleteMode}
        setDeleteMode={search.setDeleteMode}
        filterForFavorites={search.filterForFavorites}
        setFilterForFavorites={search.setFilterForFavorites}
        filterForWatchAgain={search.filterForWatchAgain}
        setFilterForWatchAgain={search.setFilterForWatchAgain}
        randomOrder={search.filterForRandomMovies}
        setRandomOrder={search.setFilterForRandomMovies}
        tvSeriesMode={search.tvSeriesMode}
        setTvSeriesMode={search.setTvSeriesMode}
        mediaTypes={availableMediaTypes ?? []}
        filterForMediaTypes={search.filterForMediaTypes}
        setFilterForMediaTypes={search.setFilterForMediaTypes}
        handleSearchSubmit={search.handleSearchSubmit}
        isDefaultFilter={search.isDefaultFilter}
        langResources={{
          placeholderLabel: t("search.placeholder"),
          searchLabel: t("search.search"),
          resultCountLabel: t("search.result_count"),
        }}
        genres={availableGenres ?? []}
        filterForGenres={search.filterForGenres}
        setFilerForGenres={search.setFilterForGenres}
      />
      <div>
        {search.searchResult && imageBaseUrl && (
          <MovieCardDeck
            movies={search.searchResult ?? []}
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
      <ResultsStatusIndicator isLoading={search.loading} hasNoResults={search.searchResult?.length == 0} hasNoMoreResults={search.searchResult?.length == search.totalMoviesCount && search.totalMoviesCount != 0} />
      <PageEndObserver onIntersect={search.handleNextPageTrigger} />
    </div>
  );
};

"use client";

import { useRef } from "react";
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
  const resultsContainerRef = useRef<HTMLDivElement | null>(null);
  const { availableMediaTypes, availableGenres } = useAvailableMediaAndGenres();
  const { appBasePath, imageBaseUrl, posterImageBaseUrl } = useAppBasePath();
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
    handleRandomSearchRequest,
    loading,
    searchResult,
    isDefaultFilter,
    handleNextPageTrigger,
  } = useMovieSearch({ session, availableMediaTypes, availableGenres });

  const { t } = useTranslation();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="-mx-2 shrink-0 border-b border-default-200/70 bg-background/95 px-2 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
          handleRandomSearchRequest={handleRandomSearchRequest}
          isDefaultFilter={isDefaultFilter}
          langResources={{
            placeholderLabel: t("search.placeholder"),
            searchLabel: t("search.search"),
            resultCountLabel: t("search.result_count"),
          }}
          mediaTypes={availableMediaTypes ?? []}
          genres={availableGenres ?? []}
        />
      </div>

      <div ref={resultsContainerRef} className="min-h-0 flex-1 overflow-y-auto pt-4">
        <div>
          {searchResult && imageBaseUrl && (
            <MovieCardDeck
              movies={searchResult}
              loadUserFlagsForMovie={loadUserFlagsForMovie}
              imageBaseUrl={imageBaseUrl}
              posterImageBaseUrl={posterImageBaseUrl}
              getDetailsUrl={(movie) => typeof appBasePath === "string" ? `${appBasePath}/details/${movie.id}` : undefined}
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

        <PageEndObserver onIntersect={handleNextPageTrigger} rootRef={resultsContainerRef} />
      </div>
    </div>
  );
};

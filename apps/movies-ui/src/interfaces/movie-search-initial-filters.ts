import { MovieSearchFilters } from "@nx-movies-db/shared-ui";

export const moviesSearchInitialFilters: MovieSearchFilters = {
  deleteMode: "INCLUDE_DELETED",
  tvSeriesMode: "INCLUDE_TVSERIES",
  filterForFavorites: false,
  filterForWatchAgain: false,
  filterForRandomMovies: false,
  filterForMediaTypes: [],
  filterForGenres: [],
};

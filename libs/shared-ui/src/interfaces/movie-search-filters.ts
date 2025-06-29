import { DeleteMode, TvSeriesMode } from ".";

export interface MovieSearchFilters {
  deleteMode: DeleteMode;
  tvSeriesMode: TvSeriesMode;
  filterForFavorites: boolean;
  filterForWatchAgain: boolean;
  filterForMediaTypes: string[];
  filterForGenres: string[];
}

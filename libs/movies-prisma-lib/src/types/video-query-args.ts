export type VideoQueryArgs = {
  ids?: string[];          // Optional string for filtering by id
  title?: string;       // Optional string for filtering by title
  diskid?: string;      // Optional string for filtering by disk ID
  genreName?: string;   // Optional string for filtering by genre name
  mediaType?: string[]; // Optional array of strings for filtering by media type
  ownerid?: string;     // Optional string for filtering by owner ID
  queryPlot?: boolean;
  queryUserSettings?: boolean;
  randomOrder?: boolean;
  filterFavorites?: boolean;
  filterFlagged?: boolean;
  userName?: string;
  deleteMode?: string;
  tvSeriesMode?: string;
  skip?: number;
  take?: number;
};

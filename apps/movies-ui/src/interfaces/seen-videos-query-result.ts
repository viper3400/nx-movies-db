import { Movie } from "./movie";

export interface SeenEntry {
  movieId: string;
  userName: string;
  viewDate: string;
  video: Movie;
}
export interface SeenVideosQueryResult {
  seenVideos: {
    requestMeta: {
      totalCount: number;
    };
    SeenEntries: SeenEntry[];
  };
}

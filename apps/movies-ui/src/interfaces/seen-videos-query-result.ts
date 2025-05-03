export interface SeenVideosQueryResult {
  seenVideos: {
    requestMeta: {
      totalCount: number;
    };
    SeenEntries: {
      movieId: string;
      userName: string;
      viewDate: string;
    }[];
  };
}

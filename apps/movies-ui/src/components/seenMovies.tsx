"use client";

import { useEffect, useState } from "react";
import { getSeenVideos } from "../app/services/actions";
import { SeenVideosQueryResult } from "../interfaces";

export const SeenMoviesComponent = () => {
  const [seenMovies, setSeenMovies] = useState<SeenVideosQueryResult>();

  useEffect(() => {
    const fetchSeenMovies = async () => {
      const movies = await getSeenVideos(
        "VG_Default",
        "2010-01-01T00:00:00Z",
        "2099-01-01T00:00:00Z",
        20,
        0
      );
      console.log(movies);
      setSeenMovies(movies);
    };

    fetchSeenMovies();
  }, []);

  return (
    <div>
      {seenMovies ? (
        seenMovies.seenVideos.SeenEntries.map((entry) => (<p key={entry.movieId}>{entry.movieId}</p>))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

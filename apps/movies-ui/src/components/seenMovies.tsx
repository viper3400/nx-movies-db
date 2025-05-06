"use client";

import { useEffect, useState } from "react";
import { deleteUserSeenDate, getSeenDates, getSeenVideos, updateUserFlags } from "../app/services/actions";
import { SeenVideosQueryResult, UserFlagsDTO } from "../interfaces";
import { MovieCard } from "@nx-movies-db/shared-ui";
import { getUserFlagsForMovie } from "../app/services/actions/getUserFlags";
import { getAppBasePath } from "../app/services/actions/getAppBasePath";

interface SeenMoviesComponentProperties {
  userName: string
}
export const SeenMoviesComponent = ({ userName }: SeenMoviesComponentProperties) => {
  const [seenMovies, setSeenMovies] = useState<SeenVideosQueryResult>();
  const [imageBaseUrl, setImageBaseUrl] = useState<string>();

  const loadUserFlagsForMovie = async (movieId: string) => {
    const flags = await getUserFlagsForMovie(movieId, userName);
    return flags;
  };

  const loadSeenDatesForMovie = async (movieId: string) => {
    const seenDates = await getSeenDates(movieId, "VG_Default");
    return seenDates;
  };

  const updateUserFlagsForMovie = async (flags: UserFlagsDTO) => {
    await updateUserFlags(
      parseInt(flags.movieId),
      flags.isFavorite,
      flags.isWatchAgain,
      userName);
  };

  const deleteUserSeenDateForMovie = async (movieId: string, date: Date) => {
    await deleteUserSeenDate(
      parseInt(movieId),
      date.toISOString().slice(0, 10),
      "VG_Default");
  };

  useEffect(() => {
    const fetchSeenMovies = async () => {
      const movies = await getSeenVideos(
        "VG_Default",
        "2010-01-01T00:00:00Z",
        "2099-01-01T00:00:00Z",
        20,
        0
      );
      setSeenMovies(movies);
    };

    const fetchAppBasePath = async () => {
      const appBasePath = await getAppBasePath();
      setImageBaseUrl(appBasePath + "/api/cover-image");
    };

    fetchAppBasePath();

    fetchSeenMovies();
  }, []);

  return (
    <div>
      {seenMovies && imageBaseUrl ? (
        seenMovies.seenVideos.SeenEntries.map((entry) => (
          <MovieCard
            key={entry.movieId} movie={entry.video}
            showMarkAsSeenButtons={false}
            showDetailsButton
            imageUrl={imageBaseUrl + "/" + entry.movieId}
            loadSeenDatesForMovie={loadSeenDatesForMovie}
            loadUserFlagsForMovie={loadUserFlagsForMovie}
            updateFlagsForMovie={updateUserFlagsForMovie}
            setUserSeenDateForMovie={function (movieId: string, date: Date): Promise<void> {
              throw new Error("Function not implemented.");
            }} deleteUserSeenDateForMovie={deleteUserSeenDateForMovie}
            langResources={{
              "seenTodayLabel": "Seen Today",
              "chooseDateLabel": "Choose Date",
              "deletedEntryLabel": "Deleted Entry"
            }} />
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

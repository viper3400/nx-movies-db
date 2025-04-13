"use client";

import { useState, useEffect } from "react";
import { getMoviesById } from "../app/services/actions/getMoviesById";
import { MovieCard } from "./movie-card";
import { getAppBasePath } from "../app/services/actions/getAppBasePath";
import { Movie, UserFlagsDTO } from "../interfaces";
import { Input, Spacer } from "@heroui/react";
import { getUserFlagsForMovie } from "../app/services/actions/getUserFlags";
import { deleteUserSeenDate, getSeenDates, setUserSeenDate, updateUserFlags } from "../app/services/actions";
import { useTranslation } from "react-i18next";

interface DetailsComponentProperties {
  id: string;
  userName: string;
}
export const DetailsComponent = ({ id, userName }: DetailsComponentProperties) => {
  const [movie, setMovie] = useState<Movie>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [imageBaseUrl, setImageBaseUrl] = useState<string>();
  const [readOnlyMode, setReadOnlyMode] = useState<boolean>(true);

  const { t } = useTranslation();


  const inputVariant = "underlined";

  const loadSeenDatesForMovie = async (movieId: string) => {
    const seenDates = await getSeenDates(movieId, "VG_Default");
    return seenDates;
  };

  const loadUserFlagsForMovie = async (movieId: string) => {
    const flags = await getUserFlagsForMovie(movieId, userName);
    return flags;
  };

  const updateUserFlagsForMovie = async (flags: UserFlagsDTO) => {
    await updateUserFlags(
      parseInt(flags.movieId),
      flags.isFavorite,
      flags.isWatchAgain,
      userName);
  };

  const setUserSeenDateForMovie = async (movieId: string, date: Date) => {
    await setUserSeenDate(
      parseInt(movieId),
      userName,
      date.toISOString().slice(0, 10),
      "VG_Default");
  };

  const deleteUserSeenDateForMovie = async (movieId: string, date: Date) => {
    await deleteUserSeenDate(
      parseInt(movieId),
      date.toISOString().slice(0, 10),
      "VG_Default");
  };

  useEffect(() => {
    const fetchAppBasePath = async () => {
      const appBasePath = await getAppBasePath();
      setImageBaseUrl(appBasePath + "/api/cover-image");
    };
    fetchAppBasePath();
  });

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const fetchedMovie = await getMoviesById(id, "INCLUDE_DELETED");
        setMovie(fetchedMovie.videos[0]);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div>
      {movie &&
        <div>
          <MovieCard
            movie={movie}
            imageUrl={imageBaseUrl + "/" + id}
            loadSeenDatesForMovie={loadSeenDatesForMovie}
            loadUserFlagsForMovie={loadUserFlagsForMovie}
            updateFlagsForMovie={updateUserFlagsForMovie}
            setUserSeenDateForMovie={setUserSeenDateForMovie}
            deleteUserSeenDateForMovie={deleteUserSeenDateForMovie}
            langResources={{
              seenTodayLabel: t("movie_card.seen_today"),
              chooseDateLabel: t("movie_card.choose_date"),
              deletedEntryLabel: t("movie_card.deleted_entry"),
              notSeenLabel: t("movie_card.not_seen"),
            }} />
          <Spacer y={4} />
          {!readOnlyMode &&
            <div>
              <Input
                size="lg"
                defaultValue={movie.title}
                isReadOnly={readOnlyMode}
                label="Titel"
                variant={inputVariant} /><Spacer y={4} /><Input
                size="lg"
                defaultValue={movie.subtitle}
                isReadOnly={readOnlyMode}
                label="Subtitel"
                variant={inputVariant} /><Spacer y={4} /><Input
                size="lg"
                defaultValue={movie.diskid}
                isReadOnly={readOnlyMode}
                label="Diskid"
                variant={inputVariant} /></div>
          }
        </div>
      }
    </div>
  );
};

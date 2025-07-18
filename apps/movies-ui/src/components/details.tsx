"use client";

import { useState, useEffect } from "react";
import { getMoviesById } from "../app/services/actions/getMoviesById";
import { MovieCard } from "@nx-movies-db/shared-ui";
import { Movie } from "../interfaces";
import { Input, Spacer } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useAppBasePath, useSeenDates, useUserFlags } from "../hooks";

interface DetailsComponentProperties {
  id: string;
  userName: string;
}
export const DetailsComponent = ({ id, userName }: DetailsComponentProperties) => {
  const [movie, setMovie] = useState<Movie>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [readOnlyMode, setReadOnlyMode] = useState<boolean>(true);

  const { imageBaseUrl } = useAppBasePath();
  const { loadUserFlagsForMovie, updateUserFlagsForMovie } = useUserFlags(userName);
  const { loadSeenDatesForMovie, setUserSeenDateForMovie, deleteUserSeenDateForMovie } = useSeenDates(userName);

  const { t } = useTranslation();

  const inputVariant = "underlined";

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

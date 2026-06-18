"use client";

import { useState, useEffect } from "react";
import { getMoviesById } from "../app/services/actions/getMoviesById";
import { MovieCard } from "@nx-movies-db/shared-ui";
import { Movie } from "../interfaces";
import { Input, Label, TextField } from "@heroui/react";
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

  const { appBasePath, imageBaseUrl, posterImageBaseUrl } = useAppBasePath();
  const { loadUserFlagsForMovie, updateUserFlagsForMovie } = useUserFlags(userName);
  const { loadSeenDatesForMovie, setUserSeenDateForMovie, deleteUserSeenDateForMovie } = useSeenDates(userName);

  const { t } = useTranslation();

  const inputVariant = "secondary";

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const fetchedMovie = await getMoviesById(id, "INCLUDE_DELETED");
        setMovie(fetchedMovie?.videos[0]);
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
    <div className="h-full min-h-0">
      {movie &&
        <div className="flex h-full min-h-0 flex-col">
          <MovieCard
            movie={movie}
            imageUrl={imageBaseUrl + "/" + id}
            bodyBackgroundImageUrl={posterImageBaseUrl ? `${posterImageBaseUrl}/${id}` : undefined}
            editUrl={`${appBasePath ?? ""}/edit/${id}`}
            loadSeenDatesForMovie={loadSeenDatesForMovie}
            loadUserFlagsForMovie={loadUserFlagsForMovie}
            updateFlagsForMovie={updateUserFlagsForMovie}
            setUserSeenDateForMovie={setUserSeenDateForMovie}
            deleteUserSeenDateForMovie={deleteUserSeenDateForMovie}
            stretchToFill
            langResources={{
              seenTodayLabel: t("movie_card.seen_today"),
              chooseDateLabel: t("movie_card.choose_date"),
              deletedEntryLabel: t("movie_card.deleted_entry"),
              editLabel: t("movie_card.edit_label")
            }} />
          {!readOnlyMode &&
            <div className="mt-4 space-y-4">
              <TextField isReadOnly={readOnlyMode}>
                <Label>Titel</Label>
                <Input data-testid="details-field-title" defaultValue={movie.title} variant={inputVariant} />
              </TextField>
              <TextField isReadOnly={readOnlyMode}>
                <Label>Subtitel</Label>
                <Input data-testid="details-field-subtitle" defaultValue={movie.subtitle} variant={inputVariant} />
              </TextField>
              <TextField isReadOnly={readOnlyMode}>
                <Label>Diskid</Label>
                <Input data-testid="details-field-diskid" defaultValue={movie.diskid} variant={inputVariant} />
              </TextField>
            </div>
          }
        </div>
      }
    </div>
  );
};

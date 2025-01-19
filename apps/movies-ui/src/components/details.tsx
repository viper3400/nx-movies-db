"use client";

import { useState, useEffect } from "react";
import { getMoviesById } from "../app/services/actions/getMoviesById";
import { MovieCard } from "./movie-card";
import { getAppBasePath } from "../app/services/actions/getAppBasePath";
import { Movie } from "../interfaces";
import { Input, Spacer, Switch } from "@nextui-org/react";

interface DetailsComponentProperties {
  id: string
}
export const DetailsComponent = ({ id }: DetailsComponentProperties) => {
  const [movie, setMovie] = useState<Movie>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [imageBaseUrl, setImageBaseUrl] = useState<string>();
  const [readOnlyMode, setReadOnlyMode] = useState<boolean>(true);

  const inputVariant = "underlined"

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
        setMovie(fetchedMovie[0]);
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
      { movie &&
      <div>
        <div className="flex flex-row">
          <Switch
          defaultSelected={!readOnlyMode}
          onValueChange={setReadOnlyMode}>
            Bearbeitungsmodus
          </Switch>
          <Spacer x={4} />
          <Switch defaultSelected>Favorit</Switch>
          <Spacer x={4} />
          <Switch defaultSelected>Nochmals sehen</Switch>
        </div>
        <Spacer y={4} />
        <MovieCard movie={movie} seenDates={[]} imageUrl={imageBaseUrl + "/" + id} />
        <Spacer y={4} />
        { !readOnlyMode &&
        <div><Input
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

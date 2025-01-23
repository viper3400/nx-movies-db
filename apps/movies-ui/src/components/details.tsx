"use client";

import { useState, useEffect, useRef } from "react";
import { getMoviesById } from "../app/services/actions/getMoviesById";
import { MovieCard } from "./movie-card";
import { getAppBasePath } from "../app/services/actions/getAppBasePath";
import { Movie, UserFlagsDTO } from "../interfaces";
import { Input, Spacer, Switch } from "@heroui/react";
import { getUserFlagsForMovie } from "../app/services/actions/getUserFlags";
import { getSeenDates, updateUserFlags } from "../app/services/actions";
import { setWorkspaceRoot } from "nx/src/utils/workspace-root";

interface DetailsComponentProperties {
  id: string;
  userName: string;
}
export const DetailsComponent = ({ id, userName }: DetailsComponentProperties) => {
  const [movie, setMovie] = useState<Movie>();
  const [loading, setLoading] = useState(true);
  const [seenDatesLoading, setSeenDatesLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [imageBaseUrl, setImageBaseUrl] = useState<string>();
  const [readOnlyMode, setReadOnlyMode] = useState<boolean>(true);
  const [seenDates, setSeenDates] = useState<string[]>([]);
  const [userFlags, setUserFlags] = useState<UserFlagsDTO>();
  const [isWatchAgain, setIsWatchAgain] = useState<boolean>();
  const [isFavorite, setIsFavorite] = useState<boolean>();

  const inputVariant = "underlined";

  const preventUpdateUserSettings = useRef(true);

  useEffect(() => {
    if (preventUpdateUserSettings.current) {
      preventUpdateUserSettings.current = false;
    } else {
      const onUserFlagsChanged = async () => {
        if (isFavorite !== undefined && isWatchAgain !== undefined) {
          setUserFlags({movieId: id, isFavorite: isFavorite, isWatchAgain: isWatchAgain});
          const result = await updateUserFlags(
            parseInt(id),
            isFavorite,
            isWatchAgain,
            userName
          );
        }
      };
      onUserFlagsChanged();
    }
  }, [isFavorite, isWatchAgain, id, userName]);

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

    const fetchUserFlags = async () => {
      preventUpdateUserSettings.current = true;
      const flags = await getUserFlagsForMovie(id, userName);
      if(flags.length > 0) {
        setIsWatchAgain(flags[0].isWatchAgain);
        setIsFavorite(flags[0].isFavorite);
        setUserFlags({movieId: id, isFavorite: flags[0].isFavorite, isWatchAgain: flags[0].isWatchAgain});
      } else {
        setIsWatchAgain(false);
        setIsFavorite(false);
      }
    };

    const fetchSeenDates = async () => {
      const dates = await getSeenDates(id, "VG_Default");
      if(dates.length >0) setSeenDates(dates);
      setSeenDatesLoading(false);
    };

    fetchMovie();
    fetchUserFlags();
    fetchSeenDates();
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
            isSelected={!readOnlyMode}
            onValueChange={setReadOnlyMode}
            isDisabled>
            Bearbeitungsmodus
          </Switch>
          <Spacer x={4} />
          { isFavorite != undefined && <Switch isSelected={isFavorite} onValueChange={setIsFavorite}>Favorit</Switch> }
          <Spacer x={4} />
          { isWatchAgain != undefined && <Switch isSelected={isWatchAgain} onValueChange={setIsWatchAgain}>Nochmals sehen</Switch> }
        </div>
        <Spacer y={4} />
        <MovieCard
          movie={movie}
          seenDates={seenDates}
          seenDatesLoading={seenDatesLoading}
          imageUrl={imageBaseUrl + "/" + id}
          userFlags={userFlags} />
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

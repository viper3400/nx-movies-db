import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider } from "@heroui/react";
import Image from "next/image";
import { FlagFilled, HeartFilled } from "./icons";
import { Movie, UserFlagsDTO } from "../interfaces";
import { TimeElapsedFormatter } from "../lib/time-elapsed-formatter";
import { useEffect, useState } from "react";

export interface MovieCardProps {
  movie: Movie;
  userFlags?: UserFlagsDTO;
  imageUrl: string;
  appBasePath?: string;
  showDetailsButton?: boolean;
  loadSeenDatesForMovie: (movieId: string) => Promise<string[]>;
  loadUserFlagsForMovie: (movieId: string) => Promise<UserFlagsDTO>;
}
export const MovieCard = ({movie, imageUrl, appBasePath, showDetailsButton, loadSeenDatesForMovie, loadUserFlagsForMovie} : MovieCardProps) => {
  const [seenDates, setSeenDates] = useState<string[]>([]);
  const [seenDatesLoading, setSeenDatesLoading] = useState(false);
  const [userFlags, setUserFlags] = useState<UserFlagsDTO>();
  const [additionalDataLoaded, setAdditionalDatesLoaded] = useState(false);

  useEffect(() => {
    const fetchSeenDates = async () => {
      setSeenDatesLoading(true);
      const dates = await loadSeenDatesForMovie(movie.id);
      setSeenDates(dates);
      setSeenDatesLoading(false);
    };

    const fetchUserFlags = async () => {
      const flags = await loadUserFlagsForMovie(movie.id);
      setUserFlags(flags);
    };

    if (!additionalDataLoaded) {
      fetchSeenDates();
      fetchUserFlags();
      setAdditionalDatesLoaded(true);
    }
  }, [movie.id]);

  return (
    <>
      <div key={movie.id}>
        <Card>
          <CardHeader className="flex flex-col px-4 py-2">
            <div className="flex items-center justify-between w-full">
              <div className="text-left font-semibold text-lg pr-2">
                {movie.title}
              </div>
              <div className="flex gap-2">
                { userFlags?.isFavorite ?
                  <Chip className="text-left w-full" color="warning">
                    <HeartFilled />
                  </Chip> : ""
                }
                { userFlags?.isWatchAgain ?
                  <Chip className="text-left w-full" color="warning">
                    <FlagFilled/>
                  </Chip> : ""
                }
                <Chip color="secondary">{movie.mediaType}</Chip>
                {movie.diskid && <Chip color="primary">{movie.diskid}</Chip>}
              </div>
            </div>
            {movie.subtitle && (
              <div className="text-left text-sm w-full">{movie.subtitle}</div>
            )}
          </CardHeader>
          <Divider />
          <div>
            <CardBody>
              <div>
                <SeenChips seenDates={seenDates ? seenDates : []} loading={seenDatesLoading} />
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <a href={`${appBasePath}/details/${movie.id}`} target="_blank" rel="noopener noreferrer">
                    <Image
                      alt="Movie Cover"
                      height={180}
                      src={imageUrl}
                      width={120}
                      className="rounded"
                    />
                  </a>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-justify">{movie.plot}</p>
                </div>
              </div>
            </CardBody>
            <Divider />
          </div>

          <CardFooter className="flex flex-row">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                {movie.ownerid == "999" && (
                  <Chip color="danger">Gelöschter Eintrag</Chip>
                )}
                {movie.genres &&
                    movie.genres.map((genreName: any) => (
                      <Chip key={genreName} color="primary" variant="flat">
                        {genreName}
                      </Chip>
                    ))}
              </div>
              <div className="flex gap-2">
                { showDetailsButton &&
                  <Button onPress={() => window.open(appBasePath + "/details/" + movie.id, "_blank")}>Details</Button>
                }
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};


const SeenChips: React.FC<{seenDates?: string[], loading: boolean }> = ({ seenDates, loading}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    // Format as DD.MM.YYYY
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const notSeen = seenDates?.length === 0 || !seenDates;
  return (
    <>
      {
        loading &&  <Chip
          className={"mr-4 mb-4 animate-pulse"}
          color="secondary"
          variant="bordered">
          Lade ...
        </Chip>
      }
      { !loading && notSeen &&
      <Chip
        className={"mr-4 mb-4"}
        variant="bordered"
        color="secondary">
        noch nicht gesehen
      </Chip>

      }
      {seenDates && seenDates.length > 0 && !loading &&
    <Chip
      className={"mr-4 mb-4"}
      color="secondary">
      {seenDates.length} x gesehen
    </Chip>
      }
      { seenDates && seenDates.length > 0  &&
      <Chip color="primary" className="mr-4 mb-4">
        {TimeElapsedFormatter.getDurationStringForDate(new Date(seenDates[seenDates.length - 1]))}
      </Chip>
      }
      { seenDates && seenDates.length > 0  &&
      seenDates.map((date, index) => (
        <Chip
          key={index}
          className="mr-4 mb-4"
          color="secondary"
          variant="flat">
          {formatDate(date)}
        </Chip>
      ))}
    </>
  );
};

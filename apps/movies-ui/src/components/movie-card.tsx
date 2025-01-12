import { Card, CardBody, CardFooter, CardHeader, Chip, Divider } from "@nextui-org/react";
import Image from "next/image";
import { UserFlagsDTO } from "./movies";
import { FlagFilled, HeartFilled } from "./icons";
import { Movie } from "../interfaces";

export interface MovieCardProps {
  movie: Movie;
  seenDates: string[];
  userFlags?: UserFlagsDTO;
  imageUrl: string;
}
export const MovieCard = ({movie, seenDates, userFlags, imageUrl} : MovieCardProps) => {
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
                <SeenChips seenDates={seenDates ? seenDates : []} />
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Image
                    alt="Movie Cover"
                    height={180}
                    src={imageUrl}
                    width={120}
                    className="rounded"
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-justify">{movie.plot}</p>
                </div>
              </div>
            </CardBody>
            <Divider />
          </div>

          <CardFooter className="flex flex-row gap-2">
            {movie.ownerid === "999" && (
              <Chip color="danger">Gelöschter Eintrag</Chip>
            )}
            {movie.genres &&
                movie.genres.map((genreName: any) => (
                  <Chip key={genreName} color="primary" variant="flat">
                    {genreName}
                  </Chip>
                ))}
          </CardFooter>
        </Card>
      </div>
    </>
  );
};


const SeenChips: React.FC<{seenDates?: string[] }> = ({ seenDates}) => {
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

  return (
    <>
      {seenDates && seenDates.length > 0 &&
    <Chip
      className="mr-4 mb-4"
      color="secondary">
      {seenDates.length} x gesehen
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
      ))
      }
    </>
  );
};

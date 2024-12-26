import { Card, CardBody, CardFooter, CardHeader, Chip, Divider } from "@nextui-org/react";
import { Movie } from "./movie-card-deck"

export interface MovieCardProps {
  movie: Movie;
  seenDates: string[]
}
export const MovieCard = ({movie, seenDates} : MovieCardProps) => {
  return (
    <>
     <div key={movie.id}>
          <Card>
            <CardHeader className="flex items-center justify-between px-4 py-2">
              <div className="text-left font-semibold text-lg pr-2">
                {movie.title}
              </div>
              <div className="flex gap-2">
                <Chip color="secondary">{movie.mediaType}</Chip>
                {movie.diskid && <Chip color="primary">{movie.diskid}</Chip>}
              </div>
            </CardHeader>
            <Divider />
            { movie.plot && (
            <div>
              <CardBody>
                <div>
                  <SeenChips seenDates={seenDates ? seenDates : []} />
                </div>
                <div>{movie.plot}</div>
              </CardBody>
              <Divider />
            </div>
            )}
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
  )
}


const SeenChips: React.FC<{seenDates?: string[] }> = ({ seenDates}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
        // Format as DD.MM.YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();

        return `${day}.${month}.${year}`;
  }

  return (
    <>
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
  )
}

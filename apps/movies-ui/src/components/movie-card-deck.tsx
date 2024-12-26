import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { Divider } from "@nextui-org/divider";
import { SeenDateDTO } from "./movies";
import { MovieCard } from "./movie-card";
// Define the interface for a single movie
export interface Movie {
  id: string;
  title: string;
  diskid?: string; // Optional
  mediaType: string;
  genres: string[];
  ownerid: string;
  plot: string;
}

// Define the props for the MovieCard component
export interface MovieCardDeckProps {
  movies: Movie[];
  seenDates?: SeenDateDTO[];
}

export const MovieCardDeck = ({ movies, seenDates }: MovieCardDeckProps) => {
  //console.log(movieCardProps);

  if (movies.length === 0) {
    return <p>No movies found.</p>;
  }

  return (
    <>
      {
        movies.map(
          ( movie : Movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          seenDates={seenDates?.find((m) => m.movieId === movie.id)?.dates ?? []} />
      )
    )}
    </>
  );
};

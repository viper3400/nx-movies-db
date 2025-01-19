import { SeenDateDTO, UserFlagsDTO } from "../interfaces";
import { MovieCard } from "./movie-card";
import { Movie } from "../interfaces";


// Define the props for the MovieCard component
export interface MovieCardDeckProps {
  movies: Movie[];
  seenDates?: SeenDateDTO[];
  userFlags?: UserFlagsDTO[];
  imageBaseUrl: string;
}

export const MovieCardDeck = ({ movies, seenDates, userFlags, imageBaseUrl }: MovieCardDeckProps) => {
  //console.log(movieCardProps);

  if (movies.length === 0) {
    return <p>No movies found.</p>;
  }
  console.log(userFlags);
  return (
    <>
      {
        movies.map(
          ( movie : Movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              seenDates={seenDates?.find((m) => m.movieId === movie.id)?.dates ?? []}
              userFlags={userFlags?.find((m) => m.movieId === movie.id) ?? undefined}
              imageUrl={imageBaseUrl + "/" + movie.id}
              showDetailsButton
            />
          )
        )}
    </>
  );
};


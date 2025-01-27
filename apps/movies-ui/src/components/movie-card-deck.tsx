import { SeenDateDTO, UserFlagsDTO } from "../interfaces";
import { MovieCard } from "./movie-card";
import { Movie } from "../interfaces";


// Define the props for the MovieCard component
export interface MovieCardDeckProps {
  movies: Movie[];
  seenDates?: SeenDateDTO[];
  seenDatesLoading: boolean;
  userFlags?: UserFlagsDTO[];
  imageBaseUrl: string;
}

export const MovieCardDeck = ({ movies, seenDates, userFlags, imageBaseUrl, seenDatesLoading }: MovieCardDeckProps) => {
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
              seenDates={seenDates?.find((m) => m.movieId === movie.id)?.dates ?? []}
              seenDatesLoading={seenDatesLoading ?? false}
              userFlags={userFlags?.find((m) => m.movieId === movie.id) ?? undefined}
              imageUrl={imageBaseUrl + "/" + movie.id}
              showDetailsButton
            />
          )
        )}
    </>
  );
};


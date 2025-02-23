import { UserFlagsDTO } from "../interfaces";
import { MovieCard } from "./movie-card";
import { Movie } from "../interfaces";

// Define the props for the MovieCard component
export interface MovieCardDeckProps {
  movies: Movie[];
  imageBaseUrl: string;
  appBasePath?: string;
  loadSeenDatesForMovie: (movieId: string) => Promise<string[]>;
  loadUserFlagsForMovie: (movieId: string) => Promise<UserFlagsDTO>;
  updateFlagsForMovie: (flags: UserFlagsDTO) => Promise<void>;
}

export const MovieCardDeck = ({
  movies,
  imageBaseUrl,
  appBasePath,
  loadSeenDatesForMovie,
  loadUserFlagsForMovie,
  updateFlagsForMovie,
}: MovieCardDeckProps & {
  loadSeenDatesForMovie: (movieId: string) => Promise<string[]>;
}) => {
  //console.log(movieCardProps);

  if (movies.length === 0) {
    return <p>No movies found.</p>;
  }
  return (
    <>
      {movies.map((movie: Movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          loadUserFlagsForMovie={loadUserFlagsForMovie}
          imageUrl={imageBaseUrl + "/" + movie.id}
          appBasePath={appBasePath}
          showDetailsButton
          loadSeenDatesForMovie={loadSeenDatesForMovie}
          updateFlagsForMovie={updateFlagsForMovie}
        />
      ))}
    </>
  );
};

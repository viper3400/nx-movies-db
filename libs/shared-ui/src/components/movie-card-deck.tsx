import { UserFlagsDTO } from "../interfaces";
import { MovieCard, MovieCardLangResources } from "./movie-card";
import { Movie } from "../interfaces";


// Define the props for the MovieCard component
export interface MovieCardDeckProps {
  movies: Movie[];
  imageBaseUrl: string;
  appBasePath?: string;
  loadSeenDatesForMovie: (movieId: string) => Promise<string[]>;
  loadUserFlagsForMovie: (movieId: string) => Promise<UserFlagsDTO>;
  updateFlagsForMovie: (flags: UserFlagsDTO) => Promise<void>;
  setUserSeenDateForMovie: (movieId: string, date: Date) => Promise<void>;
  deleteUserSeenDateForMovie: (movieId: string, date: Date) => Promise<void>;
  movieCardLangResources: MovieCardLangResources;
}

export const MovieCardDeck = ({
  movies,
  imageBaseUrl,
  appBasePath,
  loadSeenDatesForMovie,
  loadUserFlagsForMovie,
  updateFlagsForMovie,
  setUserSeenDateForMovie,
  deleteUserSeenDateForMovie,
  movieCardLangResources }: MovieCardDeckProps & { loadSeenDatesForMovie: (movieId: string) => Promise<string[]> }) => {
  //console.log(movieCardProps);

  if (movies.length === 0) {
    return <p>No movies found.</p>;
  }
  return (
    <div className="space-y-4">
      {
        movies.map(
          (movie: Movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              loadUserFlagsForMovie={loadUserFlagsForMovie}
              imageUrl={imageBaseUrl + "/" + movie.id}
              appBasePath={appBasePath}
              showDetailsButton
              showMarkAsSeenButtons
              loadSeenDatesForMovie={loadSeenDatesForMovie}
              updateFlagsForMovie={updateFlagsForMovie}
              setUserSeenDateForMovie={setUserSeenDateForMovie}
              deleteUserSeenDateForMovie={deleteUserSeenDateForMovie}
              langResources={movieCardLangResources}

            />
          )
        )}
    </div>
  );
};


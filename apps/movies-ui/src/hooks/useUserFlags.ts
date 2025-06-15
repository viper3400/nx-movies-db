import { useCallback } from "react";
import { getUserFlagsForMovie } from "../app/services/actions/getUserFlags";
import { updateUserFlags } from "../app/services/actions";
import { UserFlagsDTO } from "../interfaces";

export function useUserFlags(userName: string) {
  // Get user flags for a movie
  const loadUserFlagsForMovie = useCallback(
    async (movieId: string) => {
      return await getUserFlagsForMovie(movieId, userName);
    },
    [userName]
  );

  // Update user flags for a movie
  const updateUserFlagsForMovie = useCallback(
    async (flags: UserFlagsDTO) => {
      await updateUserFlags(
        parseInt(flags.movieId),
        flags.isFavorite,
        flags.isWatchAgain,
        userName
      );
    },
    [userName]
  );

  return { loadUserFlagsForMovie, updateUserFlagsForMovie };
}

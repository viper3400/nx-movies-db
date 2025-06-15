import { useCallback } from "react";
import { getSeenDates, setUserSeenDate, deleteUserSeenDate } from "../app/services/actions";

export function useSeenDates(userName: string) {
  const loadSeenDatesForMovie = useCallback(
    async (movieId: string) => {
      return await getSeenDates(movieId, "VG_Default");
    },
    []
  );

  const setUserSeenDateForMovie = useCallback(
    async (movieId: string, date: Date) => {
      await setUserSeenDate(
        parseInt(movieId),
        userName,
        date.toISOString().slice(0, 10),
        "VG_Default"
      );
    },
    [userName]
  );

  const deleteUserSeenDateForMovie = useCallback(
    async (movieId: string, date: Date) => {
      await deleteUserSeenDate(
        parseInt(movieId),
        date.toISOString().slice(0, 10),
        "VG_Default"
      );
    },
    []
  );

  return { loadSeenDatesForMovie, setUserSeenDateForMovie, deleteUserSeenDateForMovie };
}

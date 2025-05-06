"use client";

import { useEffect, useState } from "react";
import { deleteUserSeenDate, getSeenDates, getSeenVideos, updateUserFlags } from "../app/services/actions";
import { SeenVideosQueryResult, UserFlagsDTO } from "../interfaces";
import { MovieCard } from "@nx-movies-db/shared-ui";
import { getUserFlagsForMovie } from "../app/services/actions/getUserFlags";
import { getAppBasePath } from "../app/services/actions/getAppBasePath";
import { DatePicker, DateValue, Spacer } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";

interface SeenMoviesComponentProperties {
  userName: string
}
export const SeenMoviesComponent = ({ userName }: SeenMoviesComponentProperties) => {
  const [seenMovies, setSeenMovies] = useState<SeenVideosQueryResult>();
  const [imageBaseUrl, setImageBaseUrl] = useState<string>();
  const [fromDate, setFromDate] = useState<DateValue | null>(parseDate("2010-01-01"));
  const [toDate, setToDate] = useState<DateValue | null>(parseDate("2099-01-01"));

  const loadUserFlagsForMovie = async (movieId: string) => {
    const flags = await getUserFlagsForMovie(movieId, userName);
    return flags;
  };

  const loadSeenDatesForMovie = async (movieId: string) => {
    const seenDates = await getSeenDates(movieId, "VG_Default");
    return seenDates;
  };

  const updateUserFlagsForMovie = async (flags: UserFlagsDTO) => {
    await updateUserFlags(
      parseInt(flags.movieId),
      flags.isFavorite,
      flags.isWatchAgain,
      userName);
  };

  const deleteUserSeenDateForMovie = async (movieId: string, date: Date) => {
    await deleteUserSeenDate(
      parseInt(movieId),
      date.toISOString().slice(0, 10),
      "VG_Default");
  };

  useEffect(() => {
    const fetchAppBasePath = async () => {
      const appBasePath = await getAppBasePath();
      setImageBaseUrl(appBasePath + "/api/cover-image");
    };
    fetchAppBasePath();
  });

  useEffect(() => {
    const fetchSeenMovies = async () => {
      const movies = await getSeenVideos(
        "VG_Default",
        (fromDate ? fromDate.toDate("UTC").toISOString().slice(0, 10) + "T00:00:00Z" : "2010-01-01T00:00:00Z"),
        (toDate ? toDate.toDate("UTC").toISOString().slice(0, 10) + "T00:00:00Z" : "2099-01-01T00:00:00Z"),
        20,
        0
      );
      setSeenMovies(movies);
    };
    fetchSeenMovies();
  }, [fromDate, toDate]);

  return (
    <div>
      <div className="flex">
        <I18nProvider locale="de">
          <DatePicker
            firstDayOfWeek="mon"
            showMonthAndYearPickers
            value={fromDate}
            onChange={setFromDate}
            label="from date" />
          <Spacer x={4} />
          <DatePicker
            firstDayOfWeek="mon"
            showMonthAndYearPickers
            label="to date"
            value={toDate}
            onChange={setToDate} />
        </I18nProvider>
      </div>
      <div>
        {seenMovies && imageBaseUrl ? (
          seenMovies.seenVideos.SeenEntries.map((entry) => (
            <div key={entry.movieId}>
              <Spacer y={4} />
              <MovieCard
                movie={entry.video}
                showMarkAsSeenButtons={false}
                showDetailsButton
                imageUrl={imageBaseUrl + "/" + entry.movieId}
                loadSeenDatesForMovie={loadSeenDatesForMovie}
                loadUserFlagsForMovie={loadUserFlagsForMovie}
                updateFlagsForMovie={updateUserFlagsForMovie}
                setUserSeenDateForMovie={function (movieId: string, date: Date): Promise<void> {
                  throw new Error("Function not implemented.");
                }} deleteUserSeenDateForMovie={deleteUserSeenDateForMovie}
                langResources={{
                  "seenTodayLabel": "Seen Today",
                  "chooseDateLabel": "Choose Date",
                  "deletedEntryLabel": "Deleted Entry"
                }} />
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

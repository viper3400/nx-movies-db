"use client";

import { useEffect, useRef, useState } from "react";
import { getSeenVideos } from "../app/services/actions";
import { SeenEntry } from "../interfaces";
import { DateRange, DateRangeDrawerComponent, MovieCard, ResultsStatusIndicator } from "@nx-movies-db/shared-ui";
import { Spacer } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import PageEndObserver from "./page-end-observer";
import { useAppBasePath, useSeenDates, useUserFlags } from "../hooks";


interface SeenMoviesComponentProperties {
  userName: string
}
export const SeenMoviesComponent = ({ userName }: SeenMoviesComponentProperties) => {
  const [seenMovies, setSeenMovies] = useState<SeenEntry[] | undefined>();
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: parseDate("2010-01-01"), endDate: (parseDate("2099-01-01")) });
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [nextPage, setNextPage] = useState<number>();

  const { appBasePath, imageBaseUrl } = useAppBasePath();
  const { loadUserFlagsForMovie, updateUserFlagsForMovie } = useUserFlags(userName);
  const { loadSeenDatesForMovie, deleteUserSeenDateForMovie } = useSeenDates(userName);


  const totalMoviesCount = useRef(0);
  const isInitialLoading = useRef(true);

  useEffect(() => {
    const fetchInitialMovies = async () => {
      await fetchSeenMoviesAsync(0, dateRange);
    };

    if (isInitialLoading.current) {
      isInitialLoading.current = false;
      fetchInitialMovies();
    }
  });


  const fetchSeenMoviesAsync = async (page: number, range: DateRange) => {
    setLoading(true);
    const queryResult = await getSeenVideos(
      "VG_Default",
      (range.startDate ? range.startDate.toDate("UTC").toISOString().slice(0, 10) + "T00:00:00Z" : "2010-01-01T00:00:00Z"),
      (range.endDate ? range.endDate.toDate("UTC").toISOString().slice(0, 10) + "T00:00:00Z" : "2099-01-01T00:00:00Z"),
      10,
      page * 10
    );
    totalMoviesCount.current = queryResult.seenVideos.requestMeta.totalCount;
    setSeenMovies((prev) => prev ? [...prev, ...queryResult.seenVideos.SeenEntries] : queryResult.seenVideos.SeenEntries);

    setCurrentPage(page);
    if ((page + 1) * 10 < queryResult.seenVideos.requestMeta.totalCount) {
      setNextPage((prev) => prev ? prev + 1 : 1);
    } else {
      setNextPage(page);
    }
    setLoading(false);
  };

  const onDateRangeChanged = async (dateRange: DateRange): Promise<void> => {
    setSeenMovies(undefined);
    totalMoviesCount.current = 0;
    setDateRange(dateRange);
    await fetchSeenMoviesAsync(0, dateRange);

  };
  async function handleNextPageTrigger(): Promise<void> {
    if (!loading && nextPage !== undefined && currentPage !== undefined && nextPage > currentPage) {
      await fetchSeenMoviesAsync(nextPage, dateRange);
    }
  }

  return (
    <div>
      <div>
        <DateRangeDrawerComponent onApply={onDateRangeChanged} />
      </div>
      <div>
        {seenMovies && imageBaseUrl && (
          seenMovies.map((entry, idx) => (
            <div key={`${idx}`}>
              <Spacer y={4} />
              <MovieCard
                movie={entry.video}
                showMarkAsSeenButtons={false}
                showDetailsButton
                appBasePath={appBasePath}
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
        )}
        <ResultsStatusIndicator
          isLoading={loading}
          hasNoResults={Array.isArray(seenMovies) && seenMovies.length === 0}
          hasNoMoreResults={Array.isArray(seenMovies) && seenMovies.length > 0 && seenMovies.length === totalMoviesCount.current}
        />
      </div>
      <PageEndObserver onIntersect={handleNextPageTrigger} />
    </div>
  );
};

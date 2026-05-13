"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSeenVideos } from "../app/services/actions";
import { SeenEntry } from "../interfaces";
import { DateRange, DateRangeDrawerComponent, MovieCard, ResultsStatusIndicator } from "@nx-movies-db/shared-ui";
import { Spacer } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import PageEndObserver from "./page-end-observer";
import { useAppBasePath, useSeenDates, useUserFlags } from "../hooks";
import { AnimatePresence, motion } from "framer-motion";


interface SeenMoviesComponentProperties {
  userName: string
}
export const SeenMoviesComponent = ({ userName }: SeenMoviesComponentProperties) => {
  const resultsContainerRef = useRef<HTMLDivElement | null>(null);
  const [seenMovies, setSeenMovies] = useState<SeenEntry[] | undefined>();
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: parseDate("2010-01-01"), endDate: (parseDate("2099-01-01")) });
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [nextPage, setNextPage] = useState<number>();

  const { appBasePath, imageBaseUrl, posterImageBaseUrl } = useAppBasePath();
  const { loadUserFlagsForMovie, updateUserFlagsForMovie } = useUserFlags(userName);
  const { loadSeenDatesForMovie, deleteUserSeenDateForMovie } = useSeenDates(userName);


  const [totalMoviesCount, setTotalMoviesCount] = useState(0);
  const isInitialLoading = useRef(true);
  const inFlightRequestId = useRef(0);

  const fetchSeenMoviesAsync = async (page: number, range: DateRange) => {
    const reqId = ++inFlightRequestId.current;
    setLoading(true);
    const queryResult = await getSeenVideos(
      "VG_Default",
      (range.startDate ? range.startDate.toDate("UTC").toISOString().slice(0, 10) + "T00:00:00Z" : "2010-01-01T00:00:00Z"),
      (range.endDate ? range.endDate.toDate("UTC").toISOString().slice(0, 10) + "T00:00:00Z" : "2099-01-01T00:00:00Z"),
      10,
      page * 10
    ) as SeenVideosQueryResult;
    // Ignore late responses
    if (reqId !== inFlightRequestId.current) {
      setLoading(false);
      return;
    }
    setTotalMoviesCount(queryResult?.seenVideos.requestMeta.totalCount ?? 0);

    let combinedLength = 0;
    setSeenMovies((prev) => {
      const combined = prev ? [...prev, ...queryResult.seenVideos.SeenEntries] : queryResult.seenVideos.SeenEntries;
      combinedLength = combined.length;
      return combined;
    });

    setCurrentPage(page);
    const total = queryResult.seenVideos.requestMeta.totalCount;
    const more = combinedLength < total;
    setNextPage(more ? page + 1 : undefined);

    setLoading(false);
  };


  useEffect(() => {
    const fetchInitialMovies = async () => {
      await fetchSeenMoviesAsync(0, dateRange);
    };

    if (isInitialLoading.current) {
      isInitialLoading.current = false;
      fetchInitialMovies();
    }
  }, []);


  interface SeenVideosQueryResult {
    seenVideos: {
      requestMeta: {
        totalCount: number;
      };
      SeenEntries: SeenEntry[];
    };
  }


  const onDateRangeChanged = async (dateRange: DateRange): Promise<void> => {
    setSeenMovies(undefined);
    setTotalMoviesCount(0);
    setCurrentPage(0);
    setNextPage(undefined);
    setDateRange(dateRange);
    await fetchSeenMoviesAsync(0, dateRange);

  };
  const hasMore = Array.isArray(seenMovies) ? seenMovies.length < totalMoviesCount : false;
  async function handleNextPageTrigger(): Promise<void> {
    if (!loading && hasMore && nextPage !== undefined && nextPage > currentPage) {
      await fetchSeenMoviesAsync(nextPage, dateRange);
    }
  }

  const handleMovieRemoval = useCallback((movieId: string) => {
    let removed = false;
    setSeenMovies((prev) => {
      if (!prev) {
        return prev;
      }
      const next = prev.filter((entry) => entry.movieId !== movieId);
      removed = next.length !== prev.length;
      return removed ? next : prev;
    });
    if (removed) {
      setTotalMoviesCount((prev) => Math.max(prev - 1, 0));
    }
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="-mx-2 shrink-0 border-b border-default-200/70 bg-background/95 px-2 pb-4 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <DateRangeDrawerComponent onApply={onDateRangeChanged} />
      </div>
      <div ref={resultsContainerRef} className="min-h-0 flex-1 overflow-y-auto pt-4">
        <div>
          {seenMovies && imageBaseUrl && (
            <AnimatePresence mode="popLayout">
              {seenMovies.map((entry) => {
                const detailsUrl = typeof appBasePath === "string" ? `${appBasePath}/details/${entry.movieId}` : undefined;
                return (
                  <motion.div
                    key={entry.movieId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Spacer y={4} />
                    <MovieCard
                      movie={entry.video}
                      showMarkAsSeenButtons={false}
                      showDetailsButton
                      detailsUrl={detailsUrl}
                      imageUrl={imageBaseUrl + "/" + entry.movieId}
                      bodyBackgroundImageUrl={posterImageBaseUrl ? `${posterImageBaseUrl}/${entry.movieId}` : undefined}
                      loadSeenDatesForMovie={loadSeenDatesForMovie}
                      loadUserFlagsForMovie={loadUserFlagsForMovie}
                      updateFlagsForMovie={updateUserFlagsForMovie}
                      setUserSeenDateForMovie={function (movieId: string, date: Date): Promise<void> {
                        throw new Error("Function not implemented.");
                      }} deleteUserSeenDateForMovie={deleteUserSeenDateForMovie}
                      onAllSeenDatesDeleted={handleMovieRemoval}
                      langResources={{
                        "seenTodayLabel": "Seen Today",
                        "chooseDateLabel": "Choose Date",
                        "deletedEntryLabel": "Deleted Entry"
                      }} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <ResultsStatusIndicator
            isLoading={loading}
            hasNoResults={Array.isArray(seenMovies) && seenMovies.length === 0}
            hasNoMoreResults={Array.isArray(seenMovies) && seenMovies.length > 0 && !hasMore}
          />
        </div>
        <PageEndObserver onIntersect={handleNextPageTrigger} rootRef={resultsContainerRef} />
      </div>
    </div>
  );
};

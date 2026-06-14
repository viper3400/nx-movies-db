import { act, renderHook, waitFor } from "@testing-library/react";
import { getMovies } from "../app/services/actions";
import { useMovieSearch } from "./useMovieSearch";

jest.mock("../app/services/actions", () => ({
  getMovies: jest.fn(),
}));

const getMoviesMock = getMovies as jest.MockedFunction<typeof getMovies>;

const makeMovie = (id: string | number) => ({
  id,
  title: `Movie ${id}`,
  subtitle: "",
  genres: [],
  mediaType: "DVD",
  ownerid: 1,
  istv: false,
  runtime: null,
  rating: null,
  plot: "",
});

describe("useMovieSearch", () => {
  const session = { userName: "jan" };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should persist recent random history and send it on the next random search", async () => {
    getMoviesMock
      .mockResolvedValueOnce({
        videos: {
          videos: [makeMovie("1"), makeMovie("2")],
          requestMeta: { totalCount: 2 },
        },
      } as any)
      .mockResolvedValueOnce({
        videos: {
          videos: [makeMovie("3"), makeMovie("4")],
          requestMeta: { totalCount: 2 },
        },
      } as any);

    const { result } = renderHook(() => useMovieSearch({
      session,
      availableMediaTypes: [],
      availableGenres: [],
    }));

    await act(async () => {
      await result.current.handleRandomSearchRequest({} as any);
    });

    expect(getMoviesMock.mock.calls[0][8]).toEqual([]);

    await act(async () => {
      await result.current.handleRandomSearchRequest({} as any);
    });

    expect(getMoviesMock.mock.calls[1][8]).toEqual(["1", "2"]);

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("moviesSearchState") ?? "{}");
      expect(stored.recentRandomMovieIds).toEqual(["1", "2", "3", "4"]);
    });
  });

  it("should cap recent random history at 100 and keep normal search from mutating it", async () => {
    localStorage.setItem("moviesSearchState", JSON.stringify({
      filters: {
        deleteMode: "INCLUDE_DELETED",
        tvSeriesMode: "INCLUDE_TVSERIES",
        filterForFavorites: false,
        filterForWatchAgain: false,
        filterForMediaTypes: [],
        filterForGenres: [],
        randomExcludeDeleted: true,
      },
      searchText: "",
      recentRandomMovieIds: Array.from({ length: 100 }, (_, index) => `${index + 1}`),
    }));

    getMoviesMock
      .mockResolvedValueOnce({
        videos: {
          videos: [makeMovie("101"), makeMovie("102")],
          requestMeta: { totalCount: 2 },
        },
      } as any)
      .mockResolvedValueOnce({
        videos: {
          videos: [makeMovie("201")],
          requestMeta: { totalCount: 1 },
        },
      } as any);

    const { result } = renderHook(() => useMovieSearch({
      session,
      availableMediaTypes: [],
      availableGenres: [],
    }));

    await act(async () => {
      await result.current.handleRandomSearchRequest({} as any);
    });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("moviesSearchState") ?? "{}");
      expect(stored.recentRandomMovieIds).toHaveLength(100);
      expect(stored.recentRandomMovieIds[0]).toBe("3");
      expect(stored.recentRandomMovieIds.at(-1)).toBe("102");
    });

    await act(async () => {
      result.current.setSearchText("manual");
    });

    await act(async () => {
      await result.current.handleSearchSubmit({
        preventDefault: jest.fn(),
      } as any);
    });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("moviesSearchState") ?? "{}");
      expect(stored.recentRandomMovieIds).toHaveLength(100);
      expect(stored.recentRandomMovieIds.at(-1)).toBe("102");
    });
  });

  it("should normalize numeric persisted and returned random ids before forwarding exclusions", async () => {
    localStorage.setItem("moviesSearchState", JSON.stringify({
      filters: {
        deleteMode: "INCLUDE_DELETED",
        tvSeriesMode: "INCLUDE_TVSERIES",
        filterForFavorites: false,
        filterForWatchAgain: false,
        filterForMediaTypes: [],
        filterForGenres: [],
        randomExcludeDeleted: true,
      },
      searchText: "",
      recentRandomMovieIds: [3053, 2444],
    }));

    getMoviesMock
      .mockResolvedValueOnce({
        videos: {
          videos: [makeMovie(2150), makeMovie(2944)],
          requestMeta: { totalCount: 2 },
        },
      } as any)
      .mockResolvedValueOnce({
        videos: {
          videos: [makeMovie("5001")],
          requestMeta: { totalCount: 1 },
        },
      } as any);

    const { result } = renderHook(() => useMovieSearch({
      session,
      availableMediaTypes: [],
      availableGenres: [],
    }));

    await act(async () => {
      await result.current.handleRandomSearchRequest({} as any);
    });

    await act(async () => {
      await result.current.handleRandomSearchRequest({} as any);
    });

    expect(getMoviesMock.mock.calls[1][8]).toEqual(["3053", "2444", "2150", "2944"]);

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem("moviesSearchState") ?? "{}");
      expect(stored.recentRandomMovieIds).toEqual(["3053", "2444", "2150", "2944", "5001"]);
    });
  });
});

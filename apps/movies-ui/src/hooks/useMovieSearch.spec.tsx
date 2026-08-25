import { act, renderHook, waitFor } from "@testing-library/react";
import { getMovieSuggestions, getMovies } from "../app/services/actions";
import { moviesSearchInitialFilters } from "../interfaces";
import { useMovieSearch } from "./useMovieSearch";

jest.mock("../app/services/actions", () => ({
  getMovies: jest.fn(),
  getMovieSuggestions: jest.fn(),
}));

const getMoviesMock = getMovies as jest.MockedFunction<typeof getMovies>;
const getMovieSuggestionsMock = getMovieSuggestions as jest.MockedFunction<typeof getMovieSuggestions>;

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

  it("debounces filtered autocomplete requests until two characters are entered", async () => {
    jest.useFakeTimers();
    getMovieSuggestionsMock.mockResolvedValue([
      { id: "42", title: "Matrix", subtitle: null, diskid: "R01F1" },
    ]);

    const { result } = renderHook(() => useMovieSearch({
      session,
      availableMediaTypes: [{ value: "dvd", label: "DVD" }],
      availableGenres: [{ value: "action", label: "Action" }],
    }));

    act(() => result.current.setSearchText("m"));
    await act(async () => jest.advanceTimersByTimeAsync(250));
    expect(getMovieSuggestionsMock).not.toHaveBeenCalled();

    act(() => result.current.setFilters({
      ...result.current.filters,
      filterForFavorites: true,
      filterForMediaTypes: ["dvd"],
      filterForGenres: ["action"],
    }));
    act(() => result.current.setSearchText("ma"));
    await act(async () => jest.advanceTimersByTimeAsync(250));

    expect(getMovieSuggestionsMock).toHaveBeenCalledWith(expect.objectContaining({
      query: "ma",
      filterFavorites: true,
      mediaType: ["DVD"],
      genreName: ["Action"],
      userName: "jan",
    }));
    jest.useRealTimers();
  });

  it("ignores a stale autocomplete response when a newer request has completed", async () => {
    jest.useFakeTimers();
    const availableMediaTypes: Array<{ label: string; value: string }> = [];
    const availableGenres: Array<{ label: string; value: string }> = [];
    let resolveFirstRequest!: (value: any) => void;
    let resolveSecondRequest!: (value: any) => void;
    getMovieSuggestionsMock
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirstRequest = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecondRequest = resolve; }));

    const { result } = renderHook(() => useMovieSearch({
      session,
      availableMediaTypes,
      availableGenres,
    }));

    act(() => result.current.setSearchText("ma"));
    await act(async () => jest.advanceTimersByTimeAsync(250));
    act(() => result.current.setSearchText("mat"));
    await act(async () => jest.advanceTimersByTimeAsync(250));
    expect(getMovieSuggestionsMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveSecondRequest([{ id: "2", title: "Matrix", subtitle: null, diskid: "R01F2" }]);
      await Promise.resolve();
    });
    expect(result.current.suggestions).toEqual([expect.objectContaining({ id: "2" })]);

    await act(async () => {
      resolveFirstRequest([{ id: "1", title: "Maverick", subtitle: null, diskid: "R01F1" }]);
      await Promise.resolve();
    });
    expect(result.current.suggestions).toEqual([expect.objectContaining({ id: "2" })]);
    jest.useRealTimers();
  });

  it("persists a disabled autocomplete setting and makes no suggestion request", async () => {
    jest.useFakeTimers();
    getMovieSuggestionsMock.mockResolvedValue([]);
    localStorage.setItem("moviesSearchState", JSON.stringify({
      filters: moviesSearchInitialFilters,
      searchText: "ma",
      recentRandomMovieIds: [],
      autocompleteEnabled: false,
    }));

    const { result } = renderHook(() => useMovieSearch({
      session,
      availableMediaTypes: [],
      availableGenres: [],
    }));

    await act(async () => jest.advanceTimersByTimeAsync(250));
    expect(result.current.autocompleteEnabled).toBe(false);
    expect(getMovieSuggestionsMock).not.toHaveBeenCalled();

    act(() => result.current.setAutocompleteEnabled(true));
    await act(async () => jest.advanceTimersByTimeAsync(250));
    expect(getMovieSuggestionsMock).toHaveBeenCalledWith(expect.objectContaining({ query: "ma" }));
    expect(JSON.parse(localStorage.getItem("moviesSearchState") ?? "{}").autocompleteEnabled).toBe(true);
    jest.useRealTimers();
  });

  it("searches the selected suggestion's complete title without navigating away", async () => {
    getMoviesMock.mockResolvedValue({
      videos: {
        videos: [makeMovie("42")],
        requestMeta: { totalCount: 1 },
      },
    } as any);

    const { result } = renderHook(() => useMovieSearch({
      session,
      availableMediaTypes: [],
      availableGenres: [],
    }));

    await act(async () => {
      await result.current.handleSuggestionSelect({
        id: "42",
        title: "The Matrix",
        subtitle: null,
        diskid: "R01F1",
      });
    });

    expect(result.current.searchText).toBe("The Matrix");
    expect(getMoviesMock).toHaveBeenCalledWith(
      "The Matrix",
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      false,
      expect.anything(),
      expect.anything(),
      [],
      "jan",
      10,
      0,
    );
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

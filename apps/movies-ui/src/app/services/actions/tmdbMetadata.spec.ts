import { getTmdbMovieMetadata, getTmdbMovieMetadataResult, searchTmdbMovies } from "./tmdbMetadata";

const fetchMock = jest.fn();

describe("tmdbMetadata actions", () => {
  const originalToken = process.env.TMDB_READ_ACCESS_TOKEN;
  const originalLanguage = process.env.TMDB_LANGUAGE;
  const originalImageSize = process.env.TMDB_IMAGE_SIZE;

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.TMDB_READ_ACCESS_TOKEN = "token";
    process.env.TMDB_LANGUAGE = "de-DE";
    process.env.TMDB_IMAGE_SIZE = "w342";
  });

  afterEach(() => {
    if (originalToken === undefined) delete process.env.TMDB_READ_ACCESS_TOKEN;
    else process.env.TMDB_READ_ACCESS_TOKEN = originalToken;

    if (originalLanguage === undefined) delete process.env.TMDB_LANGUAGE;
    else process.env.TMDB_LANGUAGE = originalLanguage;

    if (originalImageSize === undefined) delete process.env.TMDB_IMAGE_SIZE;
    else process.env.TMDB_IMAGE_SIZE = originalImageSize;
  });

  it("searches TMDB movies with bearer auth and configured language", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 603,
            title: "Matrix",
            original_title: "The Matrix",
            overview: "Overview",
            release_date: "1999-03-31",
            poster_path: "/poster.jpg",
          },
        ],
      }),
    });

    const result = await searchTmdbMovies({ query: "matrix", year: 1999 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/search/movie");
    expect(String(url)).toContain("query=matrix");
    expect(String(url)).toContain("year=1999");
    expect(String(url)).toContain("language=de-DE");
    expect(init.headers.Authorization).toBe("Bearer token");
    expect(result).toEqual([
      {
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "Overview",
        releaseDate: "1999-03-31",
        posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
      },
    ]);
  });

  it("searches TMDB TV series and normalizes TV search fields", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1399,
            name: "Game of Thrones",
            original_name: "Game of Thrones",
            overview: "Overview",
            first_air_date: "2011-04-17",
            poster_path: "/poster.jpg",
          },
        ],
      }),
    });

    const result = await searchTmdbMovies({ query: "game", mediaKind: "tv" });

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/search/tv");
    expect(result).toEqual([
      {
        id: 1399,
        mediaKind: "tv",
        title: "Game of Thrones",
        originalTitle: "Game of Thrones",
        overview: "Overview",
        releaseDate: "2011-04-17",
        posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
      },
    ]);
  });

  it("normalizes movie details with credits and external ids", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 603,
          title: "Matrix",
          original_title: "The Matrix",
          overview: "Overview",
          release_date: "1999-03-31",
          runtime: 136,
          vote_average: 8.2,
          poster_path: "/poster.jpg",
          genres: [{ name: "Action" }],
          production_countries: [{ name: "United States of America" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          crew: [
            { job: "Writer", name: "Writer" },
            { job: "Director", name: "Director" },
          ],
          cast: [
            { name: "Second", order: 1 },
            { name: "First", order: 0 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ imdb_id: "tt0133093" }),
      });

    const result = await getTmdbMovieMetadata(603);

    const [detailsUrl] = fetchMock.mock.calls[0];
    const [creditsUrl] = fetchMock.mock.calls[1];
    const [externalIdsUrl] = fetchMock.mock.calls[2];
    expect(String(detailsUrl)).toContain("/movie/603");
    expect(String(creditsUrl)).toContain("/movie/603/credits");
    expect(String(externalIdsUrl)).toContain("/movie/603/external_ids");
    expect(result).toEqual({
      id: 603,
      mediaKind: "movie",
      title: "Matrix",
      originalTitle: "The Matrix",
      overview: "Overview",
      releaseDate: "1999-03-31",
      runtime: 136,
      voteAverage: 8.2,
      posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
      imdbId: "tt0133093",
      genres: ["Action"],
      productionCountries: ["United States of America"],
      directors: ["Director"],
      cast: ["First", "Second"],
      language: "de-DE",
    });
  });

  it("returns main movie details when credits and external ids fail", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 603,
          title: "Matrix",
          original_title: "The Matrix",
          overview: "Overview",
          release_date: "1999-03-31",
        }),
      })
      .mockResolvedValue({
        ok: false,
        json: async () => ({ status_message: "Not found." }),
      });

    const result = await getTmdbMovieMetadata(603);

    expect(result).toEqual(
      expect.objectContaining({
        id: 603,
        title: "Matrix",
        imdbId: null,
        directors: [],
        cast: [],
      })
    );
  });

  it("normalizes TV details with creator, episode runtime, credits, and external ids", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1399,
          name: "Game of Thrones",
          original_name: "Game of Thrones",
          overview: "Overview",
          first_air_date: "2011-04-17",
          episode_run_time: [60],
          vote_average: 8.5,
          poster_path: "/poster.jpg",
          genres: [{ name: "Drama" }],
          production_countries: [{ name: "United States of America" }],
          created_by: [{ name: "David Benioff" }, { name: "D. B. Weiss" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cast: [
            { name: "Second", order: 1 },
            { name: "First", order: 0 },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ imdb_id: "tt0944947" }),
      });

    const result = await getTmdbMovieMetadata(1399, "tv");

    const [detailsUrl] = fetchMock.mock.calls[0];
    const [creditsUrl] = fetchMock.mock.calls[1];
    const [externalIdsUrl] = fetchMock.mock.calls[2];
    expect(String(detailsUrl)).toContain("/tv/1399");
    expect(String(creditsUrl)).toContain("/tv/1399/credits");
    expect(String(externalIdsUrl)).toContain("/tv/1399/external_ids");
    expect(result).toEqual({
      id: 1399,
      mediaKind: "tv",
      title: "Game of Thrones",
      originalTitle: "Game of Thrones",
      overview: "Overview",
      releaseDate: "2011-04-17",
      runtime: 60,
      voteAverage: 8.5,
      posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
      imdbId: "tt0944947",
      genres: ["Drama"],
      productionCountries: ["United States of America"],
      directors: ["David Benioff", "D. B. Weiss"],
      cast: ["First", "Second"],
      language: "de-DE",
    });
  });

  it("returns a typed error result when main details fail", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ status_message: "Invalid id." }),
    });

    await expect(getTmdbMovieMetadataResult(603)).resolves.toEqual({
      error: "TMDB request failed with status 404. Invalid id.",
    });
  });

  it("throws a clear error when the TMDB token is missing", async () => {
    delete process.env.TMDB_READ_ACCESS_TOKEN;

    await expect(searchTmdbMovies({ query: "matrix" })).rejects.toThrow(
      "TMDB_READ_ACCESS_TOKEN is not configured."
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

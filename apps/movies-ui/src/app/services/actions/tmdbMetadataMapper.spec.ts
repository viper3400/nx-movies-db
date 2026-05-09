import { getTmdbGenreMatches, mapTmdbMovieToVideoData, type TmdbMovieDetails } from "./tmdbMetadataMapper";

const movie: TmdbMovieDetails = {
  id: 603,
  mediaKind: "movie",
  title: "Matrix",
  originalTitle: "The Matrix",
  overview: "A computer hacker learns about the true nature of reality.",
  releaseDate: "1999-03-31",
  runtime: 136,
  voteAverage: 8.2,
  posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
  imdbId: "tt0133093",
  genres: ["Action", "Science Fiction", "Unknown"],
  productionCountries: ["United States of America", "Australia"],
  directors: ["Lana Wachowski", "Lilly Wachowski"],
  cast: ["Keanu Reeves", "Laurence Fishburne"],
  language: "de-DE",
};

describe("mapTmdbMovieToVideoData", () => {
  it("classifies direct, alias-mapped, and unmatched TMDB genres", () => {
    const result = getTmdbGenreMatches(["Action", "Science Fiction", "Unknown"], [
      { label: "Action", value: "1" },
      { label: "Sci-Fi", value: "15" },
    ]);

    expect(result).toEqual([
      {
        tmdbGenre: "Action",
        localGenre: "Action",
        localGenreId: 1,
        mappedByAlias: false,
        mappedByManualOverride: false,
      },
      {
        tmdbGenre: "Science Fiction",
        localGenre: "Sci-Fi",
        localGenreId: 15,
        mappedByAlias: true,
        mappedByManualOverride: false,
      },
      {
        tmdbGenre: "Unknown",
        localGenre: undefined,
        localGenreId: undefined,
        mappedByAlias: false,
        mappedByManualOverride: false,
      },
    ]);
  });

  it("uses manual genre overrides before dropping unmatched genres", () => {
    const localGenres = [
      { label: "Action", value: "1" },
      { label: "Undefined", value: "26" },
    ];

    const matches = getTmdbGenreMatches(["Unknown"], localGenres, {
      unknown: 26,
    });
    const result = mapTmdbMovieToVideoData(
      { ...movie, genres: ["Action", "Unknown"] },
      localGenres,
      { unknown: 26 }
    );

    expect(matches).toEqual([
      {
        tmdbGenre: "Unknown",
        localGenre: "Undefined",
        localGenreId: 26,
        mappedByAlias: false,
        mappedByManualOverride: true,
      },
    ]);
    expect(result.genreIds).toEqual([1, 26]);
  });

  it("maps TMDB metadata into the existing video form shape", () => {
    const result = mapTmdbMovieToVideoData(movie, [
      { label: "Action", value: "1" },
      { label: "Sci-Fi", value: "15" },
      { label: "Drama", value: "7" },
    ]);

    expect(result).toEqual(
      expect.objectContaining({
        id: null,
        title: "Matrix",
        subtitle: "The Matrix",
        language: "de",
        year: 1999,
        runtime: 136,
        rating: "8.2",
        imdbID: "tmdb:movie:603",
        imgurl: "https://image.tmdb.org/t/p/w500/poster.jpg",
        country: "United States of America, Australia",
        director: "Lana Wachowski\nLilly Wachowski",
        actors: "Keanu Reeves\nLaurence Fishburne",
        plot: "A computer hacker learns about the true nature of reality.",
        istv: 0,
        mediatype: 1,
        owner_id: 1,
        genreIds: [1, 15],
      })
    );
  });

  it("keeps required create defaults when optional TMDB fields are absent", () => {
    const result = mapTmdbMovieToVideoData(
      {
        ...movie,
        originalTitle: "Matrix",
        releaseDate: null,
        runtime: null,
        voteAverage: null,
        posterUrl: null,
        imdbId: null,
        productionCountries: [],
        directors: [],
        cast: [],
      },
      []
    );

    expect(result.title).toBe("Matrix");
    expect(result.subtitle).toBe("");
    expect(result.year).toBe(new Date().getFullYear());
    expect(result.runtime).toBeNull();
    expect(result.rating).toBe("");
    expect(result.imgurl).toBe("");
    expect(result.imdbID).toBe("tmdb:movie:603");
    expect(result.genreIds).toEqual([]);
    expect(result.mediatype).toBe(1);
    expect(result.owner_id).toBe(1);
  });

  it("marks TV imports as TV series in the video form shape", () => {
    const result = mapTmdbMovieToVideoData({
      ...movie,
      mediaKind: "tv",
      title: "Game of Thrones",
      originalTitle: "Game of Thrones",
    }, []);

    expect(result.istv).toBe(1);
    expect(result.title).toBe("Game of Thrones");
    expect(result.imdbID).toBe("tmdb:tv:603");
  });
});

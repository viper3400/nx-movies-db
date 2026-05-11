import {
  applyTmdbMetadataMergeCandidates,
  getTmdbGenreMatches,
  getTmdbMetadataMergeCandidates,
  mapTmdbMovieToVideoData,
  type TmdbMovieDetails,
} from "./tmdbMetadataMapper";
import type { VideoData } from "@nx-movies-db/shared-types";

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
  backdropUrl: "https://image.tmdb.org/t/p/w500/backdrop.jpg",
  backdropCandidates: [
    {
      filePath: "/backdrop.jpg",
      url: "https://image.tmdb.org/t/p/w500/backdrop.jpg",
      width: 1280,
      height: 720,
      voteAverage: 5.1,
      voteCount: 10,
      iso639_1: "en",
      isPrimary: true,
    },
  ],
  imdbId: "tt0133093",
  genres: ["Action", "Science Fiction", "Unknown"],
  productionCountries: ["United States of America", "Australia"],
  directors: ["Lana Wachowski", "Lilly Wachowski"],
  cast: [
    { id: 6384, name: "Keanu Reeves", character: "Neo" },
    { id: 2975, name: "Laurence Fishburne", character: "Morpheus" },
  ],
  language: "de-DE",
};

const existingVideo: VideoData = {
  id: 530,
  md5: "abc",
  title: "Local Title",
  subtitle: "",
  language: "",
  diskid: "R01F1D01",
  comment: "Local note",
  disklabel: "Shelf",
  imdbID: "",
  year: 0,
  imgurl: "",
  director: "Local Director",
  actors: "",
  runtime: null,
  country: "",
  plot: "",
  rating: "",
  filename: "movie.mkv",
  filesize: 123,
  filedate: null,
  audio_codec: "aac",
  video_codec: "h264",
  video_width: 1920,
  video_height: 1080,
  istv: 0,
  lastupdate: null,
  mediatype: 2,
  custom1: "custom",
  custom2: "",
  custom3: "",
  custom4: "",
  created: null,
  owner_id: 7,
  genreIds: [],
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
        custom4: "https://image.tmdb.org/t/p/w500/backdrop.jpg",
        country: "United States of America, Australia",
        director: "Lana Wachowski\nLilly Wachowski",
        actors: "Keanu Reeves::Neo::tmdb:6384\nLaurence Fishburne::Morpheus::tmdb:2975",
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
        backdropUrl: null,
        backdropCandidates: [],
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
    expect(result.custom4).toBe("");
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

  it("uses the explicitly selected backdrop url for custom4", () => {
    const result = mapTmdbMovieToVideoData(
      movie,
      [],
      {},
      "https://image.tmdb.org/t/p/w500/alternate-backdrop.jpg"
    );

    expect(result.imgurl).toBe("https://image.tmdb.org/t/p/w500/poster.jpg");
    expect(result.custom4).toBe("https://image.tmdb.org/t/p/w500/alternate-backdrop.jpg");
  });
});

describe("TMDB metadata merge candidates", () => {
  it("preselects empty local fields and flags non-empty differences as conflicts", () => {
    const tmdbDraft = mapTmdbMovieToVideoData(movie, [
      { label: "Action", value: "1" },
      { label: "Sci-Fi", value: "15" },
    ]);

    const candidates = getTmdbMetadataMergeCandidates(existingVideo, tmdbDraft);

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "language",
          tmdbValue: "de",
          selected: true,
          conflict: false,
          reason: "empty-local",
        }),
        expect.objectContaining({
          field: "director",
          currentValue: "Local Director",
          selected: false,
          conflict: true,
          reason: "different-local",
        }),
        expect.objectContaining({
          field: "imdbID",
          tmdbValue: "tmdb:movie:603",
          selected: true,
          conflict: false,
        }),
        expect.objectContaining({
          field: "year",
          currentValue: 0,
          tmdbValue: 1999,
          selected: true,
          conflict: false,
        }),
        expect.objectContaining({
          field: "custom4",
          tmdbValue: "https://image.tmdb.org/t/p/w500/backdrop.jpg",
          selected: true,
          conflict: false,
          reason: "empty-local",
        }),
      ])
    );
    expect(candidates.map((candidate) => candidate.field)).not.toEqual(
      expect.arrayContaining(["diskid", "owner_id", "mediatype", "filename", "md5"])
    );
  });

  it("does not preselect a non-empty legacy external reference", () => {
    const tmdbDraft = mapTmdbMovieToVideoData(movie, []);
    const candidates = getTmdbMetadataMergeCandidates(
      { ...existingVideo, imdbID: "ofdb:123" },
      tmdbDraft
    );

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "imdbID",
          currentValue: "ofdb:123",
          tmdbValue: "tmdb:movie:603",
          selected: false,
          conflict: true,
          reason: "different-local",
        }),
      ])
    );
  });

  it("flags an existing different TMDB reference without selecting it", () => {
    const tmdbDraft = mapTmdbMovieToVideoData(movie, []);
    const candidates = getTmdbMetadataMergeCandidates(
      { ...existingVideo, imdbID: "tmdb:movie:999" },
      tmdbDraft
    );

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "imdbID",
          selected: false,
          conflict: true,
          reason: "different-tmdb-reference",
        }),
      ])
    );
  });

  it("applies only selected candidates to the existing video data", () => {
    const result = applyTmdbMetadataMergeCandidates(existingVideo, [
      {
        field: "title",
        label: "Title",
        currentValue: "Local Title",
        tmdbValue: "TMDB Title",
        selected: false,
        conflict: true,
        reason: "different-local",
      },
      {
        field: "plot",
        label: "Plot",
        currentValue: "",
        tmdbValue: "Imported plot",
        selected: true,
        conflict: false,
        reason: "empty-local",
      },
    ]);

    expect(result.title).toBe("Local Title");
    expect(result.plot).toBe("Imported plot");
    expect(result.diskid).toBe("R01F1D01");
    expect(result.owner_id).toBe(7);
  });
});

import type { VideoData } from "@nx-movies-db/shared-types";

export const TMDB_IMPORT_DRAFT_STORAGE_KEY = "nx-movies-db.tmdb-import-draft";

export type TmdbMediaKind = "movie" | "tv";

export type TmdbSearchMovieResult = {
  id: number;
  mediaKind: TmdbMediaKind;
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: string | null;
  posterUrl: string | null;
};

export type TmdbMovieDetails = {
  id: number;
  mediaKind: TmdbMediaKind;
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: string | null;
  runtime: number | null;
  voteAverage: number | null;
  posterUrl: string | null;
  imdbId: string | null;
  genres: string[];
  productionCountries: string[];
  directors: string[];
  cast: string[];
  language: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type TmdbGenreMatch = {
  tmdbGenre: string;
  localGenre?: string;
  localGenreId?: number;
  mappedByAlias: boolean;
  mappedByManualOverride: boolean;
};

const genreAliases: Record<string, string> = {
  "science fiction": "sci-fi",
};

function normalizeGenreName(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function getYear(releaseDate: string | null): number {
  if (!releaseDate) return new Date().getFullYear();

  const year = Number(releaseDate.slice(0, 4));
  return Number.isInteger(year) && year > 0 ? year : new Date().getFullYear();
}

export function getTmdbGenreMatches(
  tmdbGenres: string[],
  localGenres: SelectOption[],
  manualGenreOverrides: Record<string, number> = {}
): TmdbGenreMatch[] {
  const genresByName = new Map(
    localGenres.map((genre) => [normalizeGenreName(genre.label), genre])
  );
  const genresById = new Map(
    localGenres.map((genre) => [Number(genre.value), genre])
  );

  return tmdbGenres.map((tmdbGenre) => {
    const normalizedTmdbGenre = normalizeGenreName(tmdbGenre);
    const manualGenre = genresById.get(manualGenreOverrides[normalizedTmdbGenre]);
    if (manualGenre) {
      return {
        tmdbGenre,
        localGenre: manualGenre.label,
        localGenreId: Number(manualGenre.value),
        mappedByAlias: false,
        mappedByManualOverride: true,
      };
    }

    const mappedGenreName = genreAliases[normalizedTmdbGenre] ?? normalizedTmdbGenre;
    const localGenre = genresByName.get(mappedGenreName);

    return {
      tmdbGenre,
      localGenre: localGenre?.label,
      localGenreId: localGenre ? Number(localGenre.value) : undefined,
      mappedByAlias: mappedGenreName !== normalizedTmdbGenre,
      mappedByManualOverride: false,
    };
  });
}

export function mapTmdbMovieToVideoData(
  movie: TmdbMovieDetails,
  localGenres: SelectOption[],
  manualGenreOverrides: Record<string, number> = {}
): VideoData {
  const genreIds = getTmdbGenreMatches(movie.genres, localGenres, manualGenreOverrides)
    .map((match) => match.localGenreId)
    .filter((id): id is number => typeof id === "number");

  return {
    id: null,
    title: movie.title,
    subtitle: movie.originalTitle && movie.originalTitle !== movie.title ? movie.originalTitle : "",
    language: movie.language.split("-")[0] || "",
    country: movie.productionCountries.join(", "),
    rating: movie.voteAverage == null ? "" : String(movie.voteAverage),
    runtime: movie.runtime,
    imdbID: `tmdb:${movie.mediaKind}:${movie.id}`,
    year: getYear(movie.releaseDate),
    imgurl: movie.posterUrl ?? "",
    director: movie.directors.join("\n"),
    actors: movie.cast.join("\n"),
    plot: movie.overview,
    istv: movie.mediaKind === "tv" ? 1 : 0,
    lastupdate: null,
    mediatype: 1,
    owner_id: 1,
    genreIds,
    md5: "",
    diskid: "",
    comment: "",
    disklabel: "",
    filename: "",
    filesize: null,
    filedate: null,
    audio_codec: "",
    video_codec: "",
    video_width: null,
    video_height: null,
    custom1: "",
    custom2: "",
    custom3: "",
    custom4: "",
    created: null,
  };
}

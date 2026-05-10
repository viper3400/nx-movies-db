import type { VideoData } from "@nx-movies-db/shared-types";

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
  cast: Array<{
    id: number;
    name: string;
    character: string;
  }>;
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

export type TmdbMetadataMergeField =
  | "title"
  | "subtitle"
  | "language"
  | "country"
  | "rating"
  | "runtime"
  | "imdbID"
  | "year"
  | "imgurl"
  | "director"
  | "actors"
  | "plot"
  | "istv"
  | "genreIds";

export type TmdbMetadataMergeCandidate = {
  field: TmdbMetadataMergeField;
  label: string;
  currentValue: VideoData[TmdbMetadataMergeField];
  tmdbValue: VideoData[TmdbMetadataMergeField];
  selected: boolean;
  conflict: boolean;
  reason: "empty-local" | "different-local" | "different-tmdb-reference";
};

const mergeFieldLabels: Record<TmdbMetadataMergeField, string> = {
  title: "Title",
  subtitle: "Subtitle",
  language: "Language",
  country: "Country",
  rating: "Rating",
  runtime: "Runtime",
  imdbID: "External reference",
  year: "Year",
  imgurl: "Image URL",
  director: "Director",
  actors: "Actors",
  plot: "Plot",
  istv: "TV series",
  genreIds: "Genres",
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

function formatTmdbActorLine(actor: TmdbMovieDetails["cast"][number]): string {
  return `${actor.name}::${actor.character}::tmdb:${actor.id}`;
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
    actors: movie.cast.map(formatTmdbActorLine).join("\n"),
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

function isEmptyVideoValue(field: TmdbMetadataMergeField, value: VideoData[TmdbMetadataMergeField]): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (field === "year") return value === 0;
  return false;
}

function normalizeComparableValue(value: VideoData[TmdbMetadataMergeField]) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return [...value].sort((a, b) => a - b);
  return value;
}

function valuesEqual(
  currentValue: VideoData[TmdbMetadataMergeField],
  tmdbValue: VideoData[TmdbMetadataMergeField]
): boolean {
  return JSON.stringify(normalizeComparableValue(currentValue)) === JSON.stringify(normalizeComparableValue(tmdbValue));
}

export function getTmdbMetadataMergeCandidates(
  existing: VideoData,
  tmdbDraft: VideoData
): TmdbMetadataMergeCandidate[] {
  const fields: TmdbMetadataMergeField[] = [
    "title",
    "subtitle",
    "language",
    "country",
    "rating",
    "runtime",
    "imdbID",
    "year",
    "imgurl",
    "director",
    "actors",
    "plot",
    "istv",
    "genreIds",
  ];

  return fields.flatMap((field) => {
    const currentValue = existing[field];
    const tmdbValue = tmdbDraft[field];

    if (isEmptyVideoValue(field, tmdbValue) || valuesEqual(currentValue, tmdbValue)) {
      return [];
    }

    const localIsEmpty = isEmptyVideoValue(field, currentValue);
    const differentTmdbReference =
      field === "imdbID" &&
      typeof currentValue === "string" &&
      currentValue.startsWith("tmdb:") &&
      currentValue !== tmdbValue;

    const selected = field === "imdbID" ? localIsEmpty : localIsEmpty;
    const conflict = !localIsEmpty;

    return [{
      field,
      label: mergeFieldLabels[field],
      currentValue,
      tmdbValue,
      selected,
      conflict,
      reason: localIsEmpty
        ? "empty-local"
        : differentTmdbReference
          ? "different-tmdb-reference"
          : "different-local",
    }];
  });
}

export function applyTmdbMetadataMergeCandidates(
  existing: VideoData,
  candidates: TmdbMetadataMergeCandidate[]
): VideoData {
  return candidates.reduce<VideoData>((merged, candidate) => {
    if (!candidate.selected) return merged;
    return {
      ...merged,
      [candidate.field]: candidate.tmdbValue,
    };
  }, existing);
}

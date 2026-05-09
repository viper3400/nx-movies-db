"use server";

import type { TmdbMediaKind, TmdbMovieDetails, TmdbSearchMovieResult } from "./tmdbMetadataMapper";

type TmdbSearchResponse = {
  results?: Array<{
    id: number;
    title?: string;
    original_title?: string;
    name?: string;
    original_name?: string;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string | null;
  }>;
};

type TmdbMovieDetailsResponse = {
  id: number;
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  runtime?: number | null;
  episode_run_time?: number[];
  vote_average?: number | null;
  poster_path?: string | null;
  genres?: Array<{ name?: string }>;
  production_countries?: Array<{ name?: string }>;
  created_by?: Array<{ name?: string }>;
  external_ids?: {
    imdb_id?: string | null;
  };
  credits?: {
    crew?: Array<{ job?: string; name?: string }>;
    cast?: Array<{ id?: number; name?: string; character?: string; order?: number }>;
  };
};

type TmdbMovieCreditsResponse = NonNullable<TmdbMovieDetailsResponse["credits"]>;

type TmdbMovieExternalIdsResponse = NonNullable<TmdbMovieDetailsResponse["external_ids"]>;

export type TmdbMovieMetadataResult =
  | { movie: TmdbMovieDetails; error?: never }
  | { movie?: never; error: string };

type SearchTmdbMoviesArgs = {
  query: string;
  year?: number | null;
  page?: number | null;
  mediaKind?: TmdbMediaKind;
};

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const DEFAULT_TMDB_LANGUAGE = "en-US";
const DEFAULT_TMDB_IMAGE_SIZE = "w500";

function getTmdbConfig() {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) {
    throw new Error("TMDB_READ_ACCESS_TOKEN is not configured.");
  }

  return {
    token,
    language: process.env.TMDB_LANGUAGE ?? DEFAULT_TMDB_LANGUAGE,
    imageSize: process.env.TMDB_IMAGE_SIZE ?? DEFAULT_TMDB_IMAGE_SIZE,
  };
}

function buildPosterUrl(posterPath: string | null | undefined, imageSize: string): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}/${imageSize}${posterPath}`;
}

async function fetchTmdb<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const config = getTmdbConfig();
  const url = new URL(`${TMDB_API_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let details = "";
    try {
      const body = await response.json() as { status_message?: string };
      details = body.status_message ? ` ${body.status_message}` : "";
    } catch {
      // Keep the transport status when TMDB does not return a JSON error body.
    }
    throw new Error(`TMDB request failed with status ${response.status}.${details}`);
  }

  return response.json() as Promise<T>;
}

export async function searchTmdbMovies({
  query,
  year,
  page = 1,
  mediaKind = "movie",
}: SearchTmdbMoviesArgs): Promise<TmdbSearchMovieResult[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const config = getTmdbConfig();
  const data = await fetchTmdb<TmdbSearchResponse>(`/search/${mediaKind}`, {
    query: trimmedQuery,
    year: year ?? undefined,
    page: page ?? 1,
    language: config.language,
    include_adult: "false",
  });

  return (data.results ?? []).map((movie) => ({
    id: movie.id,
    mediaKind,
    title: movie.title ?? movie.name ?? movie.original_title ?? movie.original_name ?? `TMDB #${movie.id}`,
    originalTitle: movie.original_title ?? movie.original_name ?? movie.title ?? movie.name ?? "",
    overview: movie.overview ?? "",
    releaseDate: movie.release_date || movie.first_air_date || null,
    posterUrl: buildPosterUrl(movie.poster_path, config.imageSize),
  }));
}

export async function getTmdbMovieMetadata(tmdbId: number, mediaKind: TmdbMediaKind = "movie"): Promise<TmdbMovieDetails> {
  const config = getTmdbConfig();
  const movie = await fetchTmdb<TmdbMovieDetailsResponse>(`/${mediaKind}/${tmdbId}`, {
    language: config.language,
  });
  const basePath = `/${mediaKind}/${tmdbId}`;
  const [credits, externalIds] = await Promise.all([
    fetchTmdb<TmdbMovieCreditsResponse>(`${basePath}/credits`, { language: config.language })
      .catch(() => undefined),
    fetchTmdb<TmdbMovieExternalIdsResponse>(`${basePath}/external_ids`)
      .catch(() => undefined),
  ]);

  const directors =
    mediaKind === "tv"
      ? (movie.created_by ?? []).map((creator) => creator.name).filter((name): name is string => !!name)
      : (credits?.crew ?? [])
        .filter((member) => member.job === "Director" && member.name)
        .map((member) => member.name as string);

  const cast = [...(credits?.cast ?? [])]
    .filter((member): member is { id: number; name: string; character?: string; order?: number } =>
      typeof member.id === "number" && !!member.name
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 15)
    .map((member) => ({
      id: member.id,
      name: member.name,
      character: member.character ?? "",
    }));

  return {
    id: movie.id,
    mediaKind,
    title: movie.title ?? movie.name ?? movie.original_title ?? movie.original_name ?? `TMDB #${movie.id}`,
    originalTitle: movie.original_title ?? movie.original_name ?? movie.title ?? movie.name ?? "",
    overview: movie.overview ?? "",
    releaseDate: movie.release_date || movie.first_air_date || null,
    runtime: movie.runtime ?? movie.episode_run_time?.[0] ?? null,
    voteAverage: movie.vote_average ?? null,
    posterUrl: buildPosterUrl(movie.poster_path, config.imageSize),
    imdbId: externalIds?.imdb_id ?? null,
    genres: (movie.genres ?? []).map((genre) => genre.name).filter((name): name is string => !!name),
    productionCountries: (movie.production_countries ?? [])
      .map((country) => country.name)
      .filter((name): name is string => !!name),
    directors,
    cast,
    language: config.language,
  };
}

export async function getTmdbMovieMetadataResult(
  tmdbId: number,
  mediaKind: TmdbMediaKind = "movie"
): Promise<TmdbMovieMetadataResult> {
  try {
    return { movie: await getTmdbMovieMetadata(tmdbId, mediaKind) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "TMDB details failed.",
    };
  }
}

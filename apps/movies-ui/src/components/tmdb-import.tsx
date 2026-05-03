"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Image,
  Input,
  Select,
  SelectItem,
  Spinner,
  Switch,
  addToast,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  getTmdbGenreMatches,
  mapTmdbMovieToVideoData,
  searchTmdbMovies,
  TMDB_IMPORT_DRAFT_STORAGE_KEY,
  type TmdbMediaKind,
  type TmdbMovieDetails,
  type TmdbSearchMovieResult,
} from "../app/services/actions";
import { useAvailableMediaAndGenres } from "../hooks/useAvailableMediaAndGenres";
import { useAppBasePath } from "../hooks/useAppBasePath";
import type { Selection } from "@react-types/shared";

function getReleaseYear(releaseDate: string | null): string {
  return releaseDate ? releaseDate.slice(0, 4) : "n/a";
}

function isTmdbDetailsError(value: TmdbMovieDetails | { error?: string }): value is { error?: string } {
  return "error" in value;
}

function normalizeGenreKey(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function TmdbImport() {
  const router = useRouter();
  const { appBasePath } = useAppBasePath();
  const { availableGenres, loadingGenres, genresError } = useAvailableMediaAndGenres();
  const [mediaKind, setMediaKind] = useState<TmdbMediaKind>("movie");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchMovieResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovieDetails | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualGenreOverrides, setManualGenreOverrides] = useState<Record<string, number>>({});
  const [genrePickerTmdbGenre, setGenrePickerTmdbGenre] = useState<string | null>(null);

  const selectedDraft = useMemo(
    () => selectedMovie ? mapTmdbMovieToVideoData(selectedMovie, availableGenres, manualGenreOverrides) : null,
    [availableGenres, manualGenreOverrides, selectedMovie]
  );
  const selectedGenreMatches = useMemo(
    () => selectedMovie ? getTmdbGenreMatches(selectedMovie.genres, availableGenres, manualGenreOverrides) : [],
    [availableGenres, manualGenreOverrides, selectedMovie]
  );

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearching(true);
    setError(null);
    setSelectedMovie(null);
    setManualGenreOverrides({});
    setGenrePickerTmdbGenre(null);

    try {
      const movies = await searchTmdbMovies({
        query: trimmedQuery,
        mediaKind,
      });
      setResults(movies);
      setHasSearched(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "TMDB search failed.";
      setError(message);
      addToast({
        title: "TMDB-Suche fehlgeschlagen",
        description: message,
        severity: "danger",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = async (movie: TmdbSearchMovieResult) => {
    setLoadingDetails(true);
    setError(null);

    try {
      const response = await fetch(`${appBasePath ?? ""}/api/tmdb/${movie.mediaKind}/${movie.id}`, {
        cache: "no-store",
      });
      const result = await response.json() as TmdbMovieDetails | { error?: string };

      if (isTmdbDetailsError(result)) {
        throw new Error(result.error ?? `TMDB details failed with status ${response.status}.`);
      }
      if (!response.ok) {
        throw new Error(`TMDB details failed with status ${response.status}.`);
      }
      setSelectedMovie(result);
      setManualGenreOverrides({});
      setGenrePickerTmdbGenre(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "TMDB details failed.";
      setError(message);
      addToast({
        title: "TMDB-Details fehlgeschlagen",
        description: message,
        severity: "danger",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUseMetadata = () => {
    if (!selectedDraft) return;
    sessionStorage.setItem(TMDB_IMPORT_DRAFT_STORAGE_KEY, JSON.stringify(selectedDraft));
    router.push("/edit/new?import=tmdb");
  };

  const handleManualGenreSelection = (selection: Selection) => {
    if (selection === "all" || !genrePickerTmdbGenre) return;
    const key = Array.from(selection)[0];
    if (!key) return;

    setManualGenreOverrides((overrides) => ({
      ...overrides,
      [normalizeGenreKey(genrePickerTmdbGenre)]: Number(key),
    }));
    setGenrePickerTmdbGenre(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          data-testid="tmdb-search-query"
          label={mediaKind === "tv" ? "TMDB TV title" : "TMDB movie title"}
          value={query}
          onValueChange={setQuery}
          variant="faded"
          size="lg"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void handleSearch();
            }
          }}
        />
        <Switch
          data-testid="tmdb-media-kind-switch"
          isSelected={mediaKind === "tv"}
          onValueChange={(selected) => {
            setMediaKind(selected ? "tv" : "movie");
            setSelectedMovie(null);
            setResults([]);
            setHasSearched(false);
            setManualGenreOverrides({});
            setGenrePickerTmdbGenre(null);
          }}
          className="md:self-end"
        >
          TV series
        </Switch>
        <Button
          data-testid="tmdb-search-submit"
          color="primary"
          size="lg"
          isLoading={searching}
          isDisabled={!query.trim()}
          onPress={handleSearch}
          className="md:self-end"
        >
          Search
        </Button>
      </div>

      {error && (
        <Card shadow="sm" radius="sm" className="border border-danger-200 bg-danger-50">
          <CardBody className="text-sm text-danger-700">{error}</CardBody>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="space-y-3">
          {searching && (
            <div className="flex min-h-32 items-center justify-center">
              <Spinner label="Searching TMDB..." />
            </div>
          )}

          {!searching && results.map((movie) => (
            <Card key={movie.id} shadow="sm" radius="sm">
              <CardBody>
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                  {movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl}
                      alt=""
                      width={72}
                      height={108}
                      radius="sm"
                      className="h-[108px] w-[72px] object-cover"
                    />
                  ) : (
                    <div className="h-[108px] w-[72px] rounded-small bg-default-100" />
                  )}
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start gap-2">
                      <h2 className="text-base font-semibold leading-6">{movie.title}</h2>
                      <Chip size="sm" variant="flat" color={movie.mediaKind === "tv" ? "secondary" : "default"}>
                        {movie.mediaKind === "tv" ? "TV" : "Movie"}
                      </Chip>
                      <Chip size="sm" variant="flat">{getReleaseYear(movie.releaseDate)}</Chip>
                    </div>
                    {movie.originalTitle && movie.originalTitle !== movie.title && (
                      <p className="text-sm text-default-500">{movie.originalTitle}</p>
                    )}
                    <p className="line-clamp-3 text-sm text-default-600">{movie.overview}</p>
                    <Button
                      data-testid={`tmdb-result-${movie.id}`}
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => void handleSelect(movie)}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {!searching && hasSearched && results.length === 0 && (
            <p className="text-sm text-default-500">No TMDB results.</p>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card shadow="sm" radius="sm">
            <CardBody className="space-y-3">
              {loadingDetails && (
                <div className="flex min-h-32 items-center justify-center">
                  <Spinner label="Loading details..." />
                </div>
              )}

              {!loadingDetails && !selectedMovie && (
                <p className="text-sm text-default-500">Select a movie to preview imported fields.</p>
              )}

              {!loadingDetails && selectedMovie && selectedDraft && (
                <>
                  <div className="flex gap-3">
                    {selectedMovie.posterUrl ? (
                      <Image
                        src={selectedMovie.posterUrl}
                        alt=""
                        width={92}
                        height={138}
                        radius="sm"
                        className="h-[138px] w-[92px] object-cover"
                      />
                    ) : (
                      <div className="h-[138px] w-[92px] shrink-0 rounded-small bg-default-100" />
                    )}
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold leading-6">{selectedDraft.title}</h2>
                      <p className="text-sm text-default-500">
                        {selectedMovie.mediaKind === "tv" ? "TV series" : "Movie"} · {selectedDraft.year}
                      </p>
                      {selectedMovie.imdbId && (
                        <p className="text-sm text-default-500">{selectedMovie.imdbId}</p>
                      )}
                    </div>
                  </div>

                  <dl className="grid grid-cols-[92px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                    <dt className="text-default-500">Runtime</dt>
                    <dd>{selectedDraft.runtime ?? "n/a"}</dd>
                    <dt className="text-default-500">Rating</dt>
                    <dd>{selectedDraft.rating || "n/a"}</dd>
                    <dt className="text-default-500">Country</dt>
                    <dd>{selectedDraft.country || "n/a"}</dd>
                    <dt className="text-default-500">Director</dt>
                    <dd className="whitespace-pre-line">{selectedDraft.director || "n/a"}</dd>
                    <dt className="text-default-500">Genres</dt>
                    <dd className="flex flex-wrap gap-1">
                      {selectedGenreMatches.length
                        ? selectedGenreMatches.map((match) => (
                          <button
                            key={match.tmdbGenre}
                            type="button"
                            onClick={() => {
                              if (!match.localGenreId) {
                                setGenrePickerTmdbGenre(match.tmdbGenre);
                              }
                            }}
                            className={!match.localGenreId ? "cursor-pointer" : "cursor-default"}
                            disabled={!!match.localGenreId || loadingGenres}
                          >
                            <Chip
                              size="sm"
                              variant="flat"
                              color={
                                match.mappedByManualOverride
                                  ? "success"
                                  : !match.localGenreId
                                    ? "danger"
                                    : match.mappedByAlias
                                      ? "warning"
                                      : "default"
                              }
                            >
                              {match.localGenre && match.localGenre !== match.tmdbGenre
                                ? `${match.tmdbGenre} -> ${match.localGenre}`
                                : match.tmdbGenre}
                            </Chip>
                          </button>
                        ))
                        : "n/a"}
                    </dd>
                  </dl>

                  {genrePickerTmdbGenre && (
                    <Select
                      data-testid="tmdb-manual-genre-select"
                      label={`Map ${genrePickerTmdbGenre}`}
                      selectedKeys={new Set<string>()}
                      onSelectionChange={handleManualGenreSelection}
                      isDisabled={loadingGenres}
                      variant="faded"
                      size="sm"
                    >
                      {availableGenres.map((genre) => (
                        <SelectItem key={genre.value}>{genre.label}</SelectItem>
                      ))}
                    </Select>
                  )}

                  {genresError && (
                    <p className="text-sm text-warning-600">{genresError.message}</p>
                  )}

                  <Button
                    data-testid="tmdb-use-metadata"
                    color="primary"
                    onPress={handleUseMetadata}
                    isDisabled={loadingGenres}
                  >
                    Use metadata
                  </Button>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TmdbImport;

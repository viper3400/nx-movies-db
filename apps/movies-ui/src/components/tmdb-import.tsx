"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Switch,
  addToast,
} from "@heroui/react";
import { TmdbImportPreviewPanel, TmdbSearchResultsList } from "@nx-movies-db/shared-ui";
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
        <TmdbSearchResultsList
          results={results}
          isLoading={searching}
          hasSearched={hasSearched}
          onSelect={(movie) => void handleSelect(movie)}
        />

        <TmdbImportPreviewPanel
          isLoading={loadingDetails}
          selectedMoviePreview={selectedMovie ? {
            mediaKind: selectedMovie.mediaKind,
            posterUrl: selectedMovie.posterUrl,
            imdbId: selectedMovie.imdbId,
          } : null}
          draft={selectedDraft}
          genreMatches={selectedGenreMatches}
          availableGenres={availableGenres}
          loadingGenres={loadingGenres}
          genresErrorMessage={genresError?.message}
          genrePickerTmdbGenre={genrePickerTmdbGenre}
          onUnmappedGenrePress={setGenrePickerTmdbGenre}
          onManualGenreSelection={handleManualGenreSelection}
          onUseMetadata={handleUseMetadata}
        />
      </div>
    </div>
  );
}

export default TmdbImport;

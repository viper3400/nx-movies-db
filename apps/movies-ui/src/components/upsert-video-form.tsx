"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  EditableFormWrapper,
  TmdbMetadataMergePanel,
  TmdbMetadataSearchPanel,
  UpsertVideoDataForm,
  UpsertVideoDataFormValues,
} from "@nx-movies-db/shared-ui";
import {
  getNextDiskIdSuggestion,
  getTmdbGenreMatches,
  mapTmdbMovieToVideoData,
  searchTmdbMovies,
  upsertVideoData,
  type TmdbMediaKind,
  type TmdbMetadataMergeCandidate,
  type TmdbMovieDetails,
  type TmdbSearchMovieResult,
} from "../app/services/actions";
import { useAvailableMediaAndGenres } from "../hooks/useAvailableMediaAndGenres";
import { useAvailableOwners } from "../hooks/useAvailableOwners";
import { Button, Card, CardBody, Chip, Skeleton, addToast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { getDiskIdShelfPrefix, normalizeDiskId } from "@nx-movies-db/shared-types";
import {
  applyTmdbMetadataMergeCandidates,
  getTmdbMetadataMergeCandidates,
} from "../app/services/actions/tmdbMetadataMapper";
import { useAppBasePath } from "../hooks/useAppBasePath";
import type { Selection } from "@react-types/shared";

function isTmdbDetailsError(value: TmdbMovieDetails | { error?: string }): value is { error?: string } {
  return "error" in value;
}

function normalizeGenreKey(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function parseTmdbStoredReference(value: string | null | undefined): { mediaKind: TmdbMediaKind; id: number } | null {
  const match = value?.trim().match(/^tmdb:(movie|tv):(\d+)$/);
  if (!match) return null;

  const id = Number(match[2]);
  return Number.isInteger(id) && id > 0
    ? { mediaKind: match[1] as TmdbMediaKind, id }
    : null;
}

function getTmdbMergeBaseValues(values: UpsertVideoDataFormValues): UpsertVideoDataFormValues {
  if (values.id) return values;

  return {
    ...values,
    title: "",
    subtitle: "",
    language: "",
    country: "",
    rating: "",
    runtime: null,
    imdbID: "",
    year: 0,
    imgurl: "",
    director: "",
    actors: "",
    plot: "",
    istv: null,
    genreIds: [],
  };
}

export interface UpsertVideoFormProps {
  initialValues?: UpsertVideoDataFormValues;
  defaultOwnerId?: number;
}

export const UpsertVideoForm: React.FC<UpsertVideoFormProps> = ({
  initialValues,
  defaultOwnerId = 1,
}) => {
  const {
    availableMediaTypes,
    availableGenres,
    loadingMediaTypes,
    loadingGenres,
    mediaTypesError,
    genresError,
  } = useAvailableMediaAndGenres();
  const { availableOwners, loadingOwners, ownersError } = useAvailableOwners();
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);

  const defaults: UpsertVideoDataFormValues = useMemo(
    () =>
      initialValues ?? {
        id: null,
        title: "",
        subtitle: "",
        language: "en",
        country: "",
        rating: "",
        runtime: null,
        imdbID: "",
        filename: "",
        video_width: null,
        video_height: null,
        year: new Date().getFullYear(),
        istv: 0,
        lastupdate: null,
        mediatype: 1,
        owner_id: defaultOwnerId,
        genreIds: [],
      },
    [defaultOwnerId, initialValues]
  );

  useEffect(() => {
    const lookupError = mediaTypesError ?? genresError ?? ownersError;
    if (!lookupError) return;
    addToast({
      title: "Lookup fehlgeschlagen",
      description: lookupError.message,
      severity: "danger",
    });
  }, [mediaTypesError, genresError, ownersError]);

  const readOnlyFields = {
    id: true,
    md5: true,
    filesize: true,
    filedate: true,
    audio_codec: true,
    video_codec: true,
    video_width: true,
    video_height: true,
    lastupdate: true,
    created: true,
    mediatype: loadingMediaTypes,
    owner_id: loadingOwners,
    genreIds: loadingGenres,
  } as const;

  const showLookupSkeletons = loadingMediaTypes || loadingGenres || loadingOwners;

  return (
    <EditableFormWrapper<UpsertVideoDataFormValues>
      initialValues={defaults}
      frame="content"
      onSave={async (values) => {
        const creatingNewRecord = !values.id;
        try {
          setSaveError(null);
          const result = await upsertVideoData(values);
          addToast({
            title: "Video gespeichert",
            description: result?.title ?? values.title ?? `Eintrag #${result?.id ?? values.id ?? "?"}`,
            severity: "success",
          });

          if (creatingNewRecord && result?.id) {
            const editPath = `/edit/${result.id}`;
            router.replace(editPath);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unbekannter Fehler beim Speichern";
          setSaveError(message);
          addToast({
            title: "Konnte nicht speichern",
            description: message,
            severity: "danger",
          });
          throw error;
        }
      }}
    >
      {({ values, onChange, readOnly, dirty, saving }) => (
        <UpsertVideoFormContent
          values={values}
          onChange={onChange}
          readOnly={readOnly}
          dirty={dirty}
          saving={saving}
          saveError={saveError}
          readOnlyFields={readOnlyFields}
          showLookupSkeletons={showLookupSkeletons}
          loadingMediaTypes={loadingMediaTypes}
          loadingGenres={loadingGenres}
          loadingOwners={loadingOwners}
          genresError={genresError}
          availableMediaTypes={availableMediaTypes}
          availableGenres={availableGenres}
          availableOwners={availableOwners}
        />
      )}
    </EditableFormWrapper>
  );
};

function UpsertVideoFormContent({
  values,
  onChange,
  readOnly,
  dirty,
  saving,
  saveError,
  readOnlyFields,
  showLookupSkeletons,
  loadingMediaTypes,
  loadingGenres,
  loadingOwners,
  genresError,
  availableMediaTypes,
  availableGenres,
  availableOwners,
}: {
  values: UpsertVideoDataFormValues;
  onChange: (values: UpsertVideoDataFormValues) => void;
  readOnly: boolean;
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
  readOnlyFields: Partial<Record<keyof UpsertVideoDataFormValues, boolean>>;
  showLookupSkeletons: boolean;
  loadingMediaTypes: boolean;
  loadingGenres: boolean;
  loadingOwners: boolean;
  genresError: Error | null;
  availableMediaTypes: Array<{ label: string; value: string }>;
  availableGenres: Array<{ label: string; value: string }>;
  availableOwners: Array<{ label: string; value: string }>;
}) {
  const { appBasePath } = useAppBasePath();
  const [diskIdSuggestion, setDiskIdSuggestion] = useState<string | null>(null);
  const [loadingDiskIdSuggestion, setLoadingDiskIdSuggestion] = useState(false);
  const [tmdbPanelOpen, setTmdbPanelOpen] = useState(!values.id);
  const [tmdbMediaKind, setTmdbMediaKind] = useState<TmdbMediaKind>(values.istv === 1 ? "tv" : "movie");
  const [tmdbQuery, setTmdbQuery] = useState(values.title ?? "");
  const [tmdbResults, setTmdbResults] = useState<TmdbSearchMovieResult[]>([]);
  const [tmdbSelectedMovie, setTmdbSelectedMovie] = useState<TmdbMovieDetails | null>(null);
  const [tmdbMergeCandidates, setTmdbMergeCandidates] = useState<TmdbMetadataMergeCandidate[]>([]);
  const [tmdbManualGenreOverrides, setTmdbManualGenreOverrides] = useState<Record<string, number>>({});
  const [tmdbGenrePickerTmdbGenre, setTmdbGenrePickerTmdbGenre] = useState<string | null>(null);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [tmdbLoadingDetails, setTmdbLoadingDetails] = useState(false);
  const [tmdbHasSearched, setTmdbHasSearched] = useState(false);
  const [tmdbError, setTmdbError] = useState<string | null>(null);
  const normalizedDiskId = normalizeDiskId(values.diskid);
  const diskIdShelfPrefix = getDiskIdShelfPrefix(values.diskid);
  const tmdbSelectedGenreMatches = useMemo(
    () => tmdbSelectedMovie
      ? getTmdbGenreMatches(tmdbSelectedMovie.genres, availableGenres, tmdbManualGenreOverrides)
      : [],
    [availableGenres, tmdbManualGenreOverrides, tmdbSelectedMovie]
  );
  const tmdbStoredReference = useMemo(
    () => parseTmdbStoredReference(values.imdbID),
    [values.imdbID]
  );

  useEffect(() => {
    setTmdbPanelOpen(!values.id);
  }, [values.id]);

  useEffect(() => {
    let cancelled = false;

    if (!diskIdShelfPrefix || readOnly) {
      setDiskIdSuggestion(null);
      setLoadingDiskIdSuggestion(false);
      return;
    }

    setLoadingDiskIdSuggestion(true);
    const timeoutId = window.setTimeout(() => {
      getNextDiskIdSuggestion(diskIdShelfPrefix, values.id)
        .then((result) => {
          if (cancelled) return;
          const suggestion = result.nextDiskIdSuggestion;
          setDiskIdSuggestion(suggestion && suggestion !== normalizedDiskId ? suggestion : null);
        })
        .catch((error) => {
          if (cancelled) return;
          setDiskIdSuggestion(null);
          addToast({
            title: "Disk-ID-Vorschlag fehlgeschlagen",
            description: error instanceof Error ? error.message : "Unbekannter Fehler",
            severity: "warning",
          });
        })
        .finally(() => {
          if (!cancelled) setLoadingDiskIdSuggestion(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [diskIdShelfPrefix, normalizedDiskId, readOnly, values.id]);

  useEffect(() => {
    if (!tmdbSelectedMovie) {
      setTmdbMergeCandidates([]);
      return;
    }

    const tmdbDraft = mapTmdbMovieToVideoData(
      tmdbSelectedMovie,
      availableGenres,
      tmdbManualGenreOverrides
    );
    const nextCandidates = getTmdbMetadataMergeCandidates(getTmdbMergeBaseValues(values), tmdbDraft);
    setTmdbMergeCandidates((previousCandidates) =>
      nextCandidates.map((candidate) => {
        const previousCandidate = previousCandidates.find((item) => item.field === candidate.field);
        return previousCandidate
          ? { ...candidate, selected: previousCandidate.selected }
          : candidate;
      })
    );
  }, [availableGenres, tmdbManualGenreOverrides, tmdbSelectedMovie, values]);

  const handleTmdbSearch = async () => {
    const trimmedQuery = tmdbQuery.trim();
    if (!trimmedQuery) return;

    setTmdbSearching(true);
    setTmdbError(null);
    setTmdbSelectedMovie(null);
    setTmdbMergeCandidates([]);
    setTmdbManualGenreOverrides({});
    setTmdbGenrePickerTmdbGenre(null);

    try {
      const movies = await searchTmdbMovies({
        query: trimmedQuery,
        mediaKind: tmdbMediaKind,
      });
      setTmdbResults(movies);
      setTmdbHasSearched(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "TMDB search failed.";
      setTmdbError(message);
      addToast({
        title: "TMDB-Suche fehlgeschlagen",
        description: message,
        severity: "danger",
      });
    } finally {
      setTmdbSearching(false);
    }
  };

  const loadTmdbDetails = async (mediaKind: TmdbMediaKind, id: number) => {
    setTmdbLoadingDetails(true);
    setTmdbError(null);

    try {
      const response = await fetch(`${appBasePath ?? ""}/api/tmdb/${mediaKind}/${id}`, {
        cache: "no-store",
      });
      const result = await response.json() as TmdbMovieDetails | { error?: string };

      if (isTmdbDetailsError(result)) {
        throw new Error(result.error ?? `TMDB details failed with status ${response.status}.`);
      }
      if (!response.ok) {
        throw new Error(`TMDB details failed with status ${response.status}.`);
      }

      setTmdbSelectedMovie(result);
      setTmdbManualGenreOverrides({});
      setTmdbGenrePickerTmdbGenre(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "TMDB details failed.";
      setTmdbError(message);
      addToast({
        title: "TMDB-Details fehlgeschlagen",
        description: message,
        severity: "danger",
      });
    } finally {
      setTmdbLoadingDetails(false);
    }
  };

  const handleTmdbSelect = async (movie: TmdbSearchMovieResult) => {
    await loadTmdbDetails(movie.mediaKind, movie.id);
  };

  const handleTmdbPanelToggle = () => {
    const nextOpen = !tmdbPanelOpen;
    setTmdbPanelOpen(nextOpen);

    if (nextOpen && tmdbStoredReference) {
      setTmdbMediaKind(tmdbStoredReference.mediaKind);
      setTmdbSelectedMovie(null);
      setTmdbMergeCandidates([]);
      setTmdbManualGenreOverrides({});
      setTmdbGenrePickerTmdbGenre(null);
      void loadTmdbDetails(tmdbStoredReference.mediaKind, tmdbStoredReference.id);
    }
  };

  const handleTmdbCandidateSelectionChange = (field: string, selected: boolean) => {
    setTmdbMergeCandidates((candidates) =>
      candidates.map((candidate) =>
        candidate.field === field
          ? { ...candidate, selected }
          : candidate
      )
    );
  };

  const resetTmdbRefresh = () => {
    setTmdbSelectedMovie(null);
    setTmdbMergeCandidates([]);
    setTmdbManualGenreOverrides({});
    setTmdbGenrePickerTmdbGenre(null);
    setTmdbResults([]);
    setTmdbHasSearched(false);
    setTmdbError(null);
    setTmdbPanelOpen(false);
  };

  const handleTmdbManualGenreSelection = (selection: Selection) => {
    if (selection === "all" || !tmdbGenrePickerTmdbGenre) return;
    const key = Array.from(selection)[0];
    if (!key) return;

    setTmdbManualGenreOverrides((overrides) => ({
      ...overrides,
      [normalizeGenreKey(tmdbGenrePickerTmdbGenre)]: Number(key),
    }));
    setTmdbGenrePickerTmdbGenre(null);
  };

  const handleTmdbApplySelected = () => {
    onChange(applyTmdbMetadataMergeCandidates(values, tmdbMergeCandidates));
    resetTmdbRefresh();
    addToast({
      title: "TMDB-Metadaten übernommen",
      description: "Die ausgewählten Felder wurden in den Entwurf übernommen.",
      severity: "success",
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-default-500">
        <span>
          {values.id ? `Video #${values.id}` : "Neuer Eintrag"}
        </span>
        <Chip
          size="sm"
          color={saving ? "primary" : dirty ? "warning" : "success"}
          variant={saving ? "solid" : "flat"}
        >
          {saving ? "Speichere..." : dirty ? "Änderungen vorhanden" : "Alle Änderungen gespeichert"}
        </Chip>
      </div>

      {showLookupSkeletons && (
        <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
          {loadingMediaTypes && <Skeleton className="h-12 w-full rounded-large" />}
          {loadingGenres && <Skeleton className="h-12 w-full rounded-large" />}
          {loadingOwners && <Skeleton className="h-12 w-full rounded-large sm:col-span-2" />}
        </div>
      )}

      {saveError && (
        <Card shadow="sm" radius="sm" className="border border-danger-200 bg-danger-50">
          <CardBody className="text-sm text-danger-700">
            <p className="font-medium">Konnte nicht speichern</p>
            <p>{saveError}</p>
          </CardBody>
        </Card>
      )}

      <div className="space-y-3 rounded-small border border-default-200 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">
              {values.id ? "TMDB refresh" : "TMDB import"}
            </h2>
            <p className="text-sm text-default-500">Search and apply selected metadata to this draft.</p>
          </div>
          {values.id && (
            <Button
              data-testid="tmdb-refresh-toggle"
              size="sm"
              variant="flat"
              onPress={handleTmdbPanelToggle}
            >
              {tmdbPanelOpen ? "Hide" : "Refresh metadata"}
            </Button>
          )}
        </div>

        {tmdbPanelOpen && (
          <div data-testid="tmdb-refresh-panel" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,460px)]">
              <TmdbMetadataSearchPanel
                query={tmdbQuery}
                mediaKind={tmdbMediaKind}
                results={tmdbResults}
                isSearching={tmdbSearching}
                hasSearched={tmdbHasSearched}
                errorMessage={tmdbError}
                onQueryChange={setTmdbQuery}
                onMediaKindChange={(mediaKind) => {
                  setTmdbMediaKind(mediaKind);
                  setTmdbSelectedMovie(null);
                  setTmdbMergeCandidates([]);
                  setTmdbManualGenreOverrides({});
                  setTmdbGenrePickerTmdbGenre(null);
                  setTmdbResults([]);
                  setTmdbHasSearched(false);
                }}
                onSearch={handleTmdbSearch}
                onSelect={(movie) => void handleTmdbSelect(movie)}
                queryTestId="tmdb-refresh-query"
                mediaKindTestId="tmdb-refresh-media-kind"
                submitTestId="tmdb-refresh-search-submit"
              />

              {tmdbLoadingDetails ? (
                <div
                  data-testid="tmdb-refresh-details-loading"
                  className="flex min-h-32 items-center justify-center rounded-small border border-default-200 text-sm text-default-500"
                >
                  Loading details...
                </div>
              ) : tmdbSelectedMovie ? (
                <TmdbMetadataMergePanel
                  candidates={tmdbMergeCandidates}
                  tmdbImdbId={tmdbSelectedMovie.imdbId}
                  genreMatches={tmdbSelectedGenreMatches}
                  availableGenres={availableGenres}
                  loadingGenres={loadingGenres}
                  genresErrorMessage={genresError?.message}
                  genrePickerTmdbGenre={tmdbGenrePickerTmdbGenre}
                  onCandidateSelectionChange={handleTmdbCandidateSelectionChange}
                  onUnmappedGenrePress={setTmdbGenrePickerTmdbGenre}
                  onManualGenreSelection={handleTmdbManualGenreSelection}
                  onApplySelected={handleTmdbApplySelected}
                  onNoMatch={resetTmdbRefresh}
                />
              ) : (
                <div
                  data-testid="tmdb-refresh-empty"
                  className="rounded-small border border-default-200 p-3 text-sm text-default-500"
                >
                  Select a TMDB result to review field updates.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <UpsertVideoDataForm
        values={values}
        onChange={onChange}
        readOnly={readOnly}
        readOnlyFields={readOnlyFields}
        inputVariant="faded"
        mediaTypeOptions={availableMediaTypes}
        genreOptions={availableGenres}
        ownerOptions={availableOwners}
        diskIdSuggestion={diskIdSuggestion}
        isDiskIdSuggestionLoading={loadingDiskIdSuggestion}
      />
    </div>
  );
}

export default UpsertVideoForm;

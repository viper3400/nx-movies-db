"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  EditableFormWrapper,
  UpsertVideoDataForm,
  UpsertVideoDataFormValues,
} from "@nx-movies-db/shared-ui";
import { getNextDiskIdSuggestion, upsertVideoData } from "../app/services/actions";
import { useAvailableMediaAndGenres } from "../hooks/useAvailableMediaAndGenres";
import { useAvailableOwners } from "../hooks/useAvailableOwners";
import { Card, CardBody, Chip, Skeleton, addToast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { getDiskIdShelfPrefix, normalizeDiskId } from "@nx-movies-db/shared-types";
import type { VideoData } from "@nx-movies-db/shared-types";
import { TMDB_IMPORT_DRAFT_STORAGE_KEY } from "../app/services/actions/tmdbMetadataMapper";

export interface UpsertVideoFormProps {
  initialValues?: UpsertVideoDataFormValues;
  consumeTmdbImportDraft?: boolean;
  defaultOwnerId?: number;
}

export const UpsertVideoForm: React.FC<UpsertVideoFormProps> = ({
  initialValues,
  consumeTmdbImportDraft = false,
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
  const [importedInitialValues, setImportedInitialValues] = useState<VideoData | undefined>();
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues || !consumeTmdbImportDraft) return;

    const storedDraft = sessionStorage.getItem(TMDB_IMPORT_DRAFT_STORAGE_KEY);
    if (!storedDraft) return;

    try {
      setImportedInitialValues({
        ...(JSON.parse(storedDraft) as VideoData),
        owner_id: defaultOwnerId,
      });
      sessionStorage.removeItem(TMDB_IMPORT_DRAFT_STORAGE_KEY);
    } catch (error) {
      sessionStorage.removeItem(TMDB_IMPORT_DRAFT_STORAGE_KEY);
      addToast({
        title: "TMDB-Import fehlgeschlagen",
        description: error instanceof Error ? error.message : "Importdaten konnten nicht gelesen werden.",
        severity: "danger",
      });
    }
  }, [consumeTmdbImportDraft, defaultOwnerId, initialValues]);

  const defaults: UpsertVideoDataFormValues = useMemo(
    () =>
      initialValues ?? importedInitialValues ?? {
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
    [defaultOwnerId, importedInitialValues, initialValues]
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
  availableMediaTypes: Array<{ label: string; value: string }>;
  availableGenres: Array<{ label: string; value: string }>;
  availableOwners: Array<{ label: string; value: string }>;
}) {
  const [diskIdSuggestion, setDiskIdSuggestion] = useState<string | null>(null);
  const [loadingDiskIdSuggestion, setLoadingDiskIdSuggestion] = useState(false);
  const normalizedDiskId = normalizeDiskId(values.diskid);
  const diskIdShelfPrefix = getDiskIdShelfPrefix(values.diskid);

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

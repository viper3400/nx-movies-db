"use client";

import React, { useEffect, useMemo } from "react";
import {
  EditableFormWrapper,
  UpsertVideoDataForm,
  UpsertVideoDataFormValues,
} from "@nx-movies-db/shared-ui";
import { upsertVideoData } from "../app/services/actions";
import { useAvailableMediaAndGenres } from "../hooks/useAvailableMediaAndGenres";
import { useAvailableOwners } from "../hooks/useAvailableOwners";
import { Chip, Skeleton, addToast } from "@heroui/react";
import { useRouter } from "next/navigation";

export interface UpsertVideoFormProps {
  initialValues?: UpsertVideoDataFormValues;
}

export const UpsertVideoForm: React.FC<UpsertVideoFormProps> = ({ initialValues }) => {
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
        owner_id: 1,
        genreIds: [],
      },
    [initialValues]
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
          const result = await upsertVideoData(values);
          addToast({
            title: "Video gespeichert",
            description: result?.title ?? values.title ?? `Eintrag #${result?.id ?? values.id ?? "?"}`,
            severity: "success",
          });

          if (creatingNewRecord && result?.id) {
            router.replace(`/edit/${result.id}`);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unbekannter Fehler beim Speichern";
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

          <UpsertVideoDataForm
            values={values}
            onChange={onChange}
            readOnly={readOnly}
            readOnlyFields={readOnlyFields}
            inputVariant="faded"
            mediaTypeOptions={availableMediaTypes}
            genreOptions={availableGenres}
            ownerOptions={availableOwners}
          />
        </div>
      )}
    </EditableFormWrapper>
  );
};

export default UpsertVideoForm;

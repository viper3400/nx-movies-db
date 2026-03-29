"use client";

import React from "react";
import {
  EditableFormWrapper,
  UpsertVideoDataForm,
  UpsertVideoDataFormValues,
} from "@nx-movies-db/shared-ui";
import { upsertVideoData } from "../app/services/actions";
import { useAvailableMediaAndGenres } from "../hooks/useAvailableMediaAndGenres";
import { useAvailableOwners } from "../hooks/useAvailableOwners";
import { Chip, addToast } from "@heroui/react";
import { useRouter } from "next/navigation";

export interface UpsertVideoFormProps {
  initialValues?: UpsertVideoDataFormValues;
}

export const UpsertVideoForm: React.FC<UpsertVideoFormProps> = ({ initialValues }) => {
  const { availableMediaTypes, availableGenres } = useAvailableMediaAndGenres();
  const { availableOwners } = useAvailableOwners();
  const router = useRouter();
  const defaults: UpsertVideoDataFormValues =
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
    };

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

          <UpsertVideoDataForm
            values={values}
            onChange={onChange}
            readOnly={readOnly}
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

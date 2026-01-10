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

export interface UpsertVideoFormProps {
  initialValues?: UpsertVideoDataFormValues;
}

export const UpsertVideoForm: React.FC<UpsertVideoFormProps> = ({ initialValues }) => {
  const { availableMediaTypes, availableGenres } = useAvailableMediaAndGenres();
  const { availableOwners } = useAvailableOwners();
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
      year: null,
      istv: null,
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
        await upsertVideoData(values);
      }}
    >
      {({ values, onChange, readOnly }) => (
        <UpsertVideoDataForm
          values={values}
          onChange={onChange}
          readOnly={readOnly}
          inputVariant="faded"
          mediaTypeOptions={availableMediaTypes}
          genreOptions={availableGenres}
          ownerOptions={availableOwners}
        />
      )}
    </EditableFormWrapper>
  );
};

export default UpsertVideoForm;

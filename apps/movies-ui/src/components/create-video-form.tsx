"use client";

import React from "react";
import {
  EditableFormWrapper,
  UpsertVideoDataForm,
  UpsertVideoDataFormValues,
} from "@nx-movies-db/shared-ui";
import { upsertVideoData } from "../app/services/actions";

export interface CreateVideoFormProps {
  initialValues?: UpsertVideoDataFormValues;
}

export const CreateVideoForm: React.FC<CreateVideoFormProps> = ({ initialValues }) => {
  const defaults: UpsertVideoDataFormValues =
    initialValues ?? {
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
      mediatype: 1,
      owner_id: 1
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
        />
      )}
    </EditableFormWrapper>
  );
};

export default CreateVideoForm;

"use client";

import React, { useState } from "react";
import {
  Input,
  Textarea,
  DatePicker,
  DateValue,
  Spacer,
} from "@heroui/react";
import { VideoData } from "@nx-movies-db/shared-types";

interface UpsertVideoDataFormProps {
  values: VideoData;
  onChange: (values: VideoData) => void;
  readOnly?: boolean;
  readOnlyFields?: Partial<Record<keyof VideoData, boolean>>;
  inputVariant?: "flat" | "bordered" | "underlined" | "faded";
  className?: string;
}

function dateValueToJS(dateValue: DateValue | null): Date | null {
  if (!dateValue) return null;
  const { year, month, day } = dateValue;
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

export const UpsertVideoDataForm: React.FC<UpsertVideoDataFormProps> = ({
  values,
  onChange,
  readOnly = false,
  readOnlyFields,
  inputVariant = "underlined",
  className,
}) => {
  const [filedateValue, setFiledateValue] = useState<DateValue | null>(null);
  const [lastupdateValue, setLastupdateValue] = useState<DateValue | null>(null);
  const [createdValue, setCreatedValue] = useState<DateValue | null>(null);

  const set = (patch: Partial<VideoData>) =>
    onChange({ ...values, ...patch });

  const ro = (k: keyof VideoData) => readOnly || !!readOnlyFields?.[k];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ID"
          type="number"
          value={values.id?.toString() ?? ""}
          onChange={(e) => set({ id: e.target.value ? Number(e.target.value) : null })}
          isReadOnly={ro("id")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="MD5"
          value={values.md5 ?? ""}
          onChange={(e) => set({ md5: e.target.value })}
          isReadOnly={ro("md5")}
          variant={inputVariant}
          size="lg"
        />

        <Input
          label="Title"
          value={values.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
          isReadOnly={ro("title")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="Subtitle"
          value={values.subtitle ?? ""}
          onChange={(e) => set({ subtitle: e.target.value })}
          isReadOnly={ro("subtitle")}
          variant={inputVariant}
          size="lg"
        />

        <Input
          label="Language"
          value={values.language ?? ""}
          onChange={(e) => set({ language: e.target.value })}
          isReadOnly={ro("language")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="Disk ID"
          value={values.diskid ?? ""}
          onChange={(e) => set({ diskid: e.target.value })}
          isReadOnly={ro("diskid")}
          variant={inputVariant}
          size="lg"
        />

        <Textarea
          label="Comment"
          value={values.comment ?? ""}
          onChange={(e) => set({ comment: e.target.value })}
          isReadOnly={ro("comment")}
          variant={inputVariant}
          minRows={2}
        />
        <Input
          label="Disk Label"
          value={values.disklabel ?? ""}
          onChange={(e) => set({ disklabel: e.target.value })}
          isReadOnly={ro("disklabel")}
          variant={inputVariant}
          size="lg"
        />

        <Input
          label="IMDB ID"
          value={values.imdbID ?? ""}
          onChange={(e) => set({ imdbID: e.target.value })}
          isReadOnly={ro("imdbID")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="Year"
          type="number"
          value={values.year?.toString() ?? ""}
          onChange={(e) => set({ year: e.target.value ? Number(e.target.value) : null })}
          isReadOnly={ro("year")}
          variant={inputVariant}
          size="lg"
        />

        <Input
          label="Image URL"
          value={values.imgurl ?? ""}
          onChange={(e) => set({ imgurl: e.target.value })}
          isReadOnly={ro("imgurl")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="Director"
          value={values.director ?? ""}
          onChange={(e) => set({ director: e.target.value })}
          isReadOnly={ro("director")}
          variant={inputVariant}
          size="lg"
        />

        <Textarea
          label="Actors"
          value={values.actors ?? ""}
          onChange={(e) => set({ actors: e.target.value })}
          isReadOnly={ro("actors")}
          variant={inputVariant}
          minRows={2}
        />
        <Input
          label="Runtime (min)"
          type="number"
          value={values.runtime?.toString() ?? ""}
          onChange={(e) => set({ runtime: e.target.value ? Number(e.target.value) : null })}
          isReadOnly={ro("runtime")}
          variant={inputVariant}
          size="lg"
        />

        <Input
          label="Country"
          value={values.country ?? ""}
          onChange={(e) => set({ country: e.target.value })}
          isReadOnly={ro("country")}
          variant={inputVariant}
          size="lg"
        />
        <Textarea
          label="Plot"
          value={values.plot ?? ""}
          onChange={(e) => set({ plot: e.target.value })}
          isReadOnly={ro("plot")}
          variant={inputVariant}
          minRows={3}
        />

        <Input
          label="Rating"
          value={values.rating ?? ""}
          onChange={(e) => set({ rating: e.target.value })}
          isReadOnly={ro("rating")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="Filename"
          value={values.filename ?? ""}
          onChange={(e) => set({ filename: e.target.value })}
          isReadOnly={ro("filename")}
          variant={inputVariant}
          size="lg"
        />

        <Input
          label="Filesize (bytes)"
          type="number"
          value={values.filesize?.toString() ?? ""}
          onChange={(e) => set({ filesize: e.target.value ? Number(e.target.value) : null })}
          isReadOnly={ro("filesize")}
          variant={inputVariant}
          size="lg"
        />

        <DatePicker
          label="File Date"
          value={filedateValue}
          onChange={(v) => {
            setFiledateValue(v);
            set({ filedate: dateValueToJS(v) });
          }}
          isReadOnly={ro("filedate")}
          className="max-w-[284px]"
          granularity="day"
          showMonthAndYearPickers
        />

        <Input
          label="Audio Codec"
          value={values.audio_codec ?? ""}
          onChange={(e) => set({ audio_codec: e.target.value })}
          isReadOnly={ro("audio_codec")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="Video Codec"
          value={values.video_codec ?? ""}
          onChange={(e) => set({ video_codec: e.target.value })}
          isReadOnly={ro("video_codec")}
          variant={inputVariant}
          size="lg"
        />

        <Input
          label="Video Width"
          type="number"
          value={values.video_width?.toString() ?? ""}
          onChange={(e) => set({ video_width: e.target.value ? Number(e.target.value) : null })}
          isReadOnly={ro("video_width")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="Video Height"
          type="number"
          value={values.video_height?.toString() ?? ""}
          onChange={(e) => set({ video_height: e.target.value ? Number(e.target.value) : null })}
          isReadOnly={ro("video_height")}
          variant={inputVariant}
          size="lg"
        />

        <Input
          label="Is TV (0/1)"
          type="number"
          value={values.istv?.toString() ?? ""}
          onChange={(e) => set({ istv: e.target.value ? Number(e.target.value) : null })}
          isReadOnly={ro("istv")}
          variant={inputVariant}
          size="lg"
        />

        <DatePicker
          label="Last Update"
          value={lastupdateValue}
          onChange={(v) => {
            setLastupdateValue(v);
            set({ lastupdate: dateValueToJS(v) });
          }}
          isReadOnly={ro("lastupdate")}
          className="max-w-[284px]"
          granularity="day"
          showMonthAndYearPickers
        />

        <Input
          label="Media Type"
          type="number"
          value={values.mediatype?.toString() ?? ""}
          onChange={(e) => set({ mediatype: e.target.value ? Number(e.target.value) : null })}
          isReadOnly={ro("mediatype")}
          variant={inputVariant}
          size="lg"
        />

        <Input
          label="Custom 1"
          value={values.custom1 ?? ""}
          onChange={(e) => set({ custom1: e.target.value })}
          isReadOnly={ro("custom1")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="Custom 2"
          value={values.custom2 ?? ""}
          onChange={(e) => set({ custom2: e.target.value })}
          isReadOnly={ro("custom2")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="Custom 3"
          value={values.custom3 ?? ""}
          onChange={(e) => set({ custom3: e.target.value })}
          isReadOnly={ro("custom3")}
          variant={inputVariant}
          size="lg"
        />
        <Input
          label="Custom 4"
          value={values.custom4 ?? ""}
          onChange={(e) => set({ custom4: e.target.value })}
          isReadOnly={ro("custom4")}
          variant={inputVariant}
          size="lg"
        />

        <DatePicker
          label="Created"
          value={createdValue}
          onChange={(v) => {
            setCreatedValue(v);
            set({ created: dateValueToJS(v) });
          }}
          isReadOnly={ro("created")}
          className="max-w-[284px]"
          granularity="day"
          showMonthAndYearPickers
        />

        <Input
          label="Owner ID"
          type="number"
          value={values.owner_id?.toString() ?? ""}
          onChange={(e) => set({ owner_id: e.target.value ? Number(e.target.value) : null })}
          isReadOnly={ro("owner_id")}
          variant={inputVariant}
          size="lg"
        />
      </div>
      <Spacer y={4} />
    </div>
  );
};

export default UpsertVideoDataForm;

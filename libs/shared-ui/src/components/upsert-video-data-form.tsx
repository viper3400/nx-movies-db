"use client";

import React from "react";
import {
  Input,
  Textarea,
  DatePicker,
  DateValue,
  Spacer,
  Select,
  SelectItem,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { VideoData } from "@nx-movies-db/shared-types";
import type { Selection } from "@react-types/shared";

export type UpsertVideoDataFormValues = VideoData;

interface UpsertVideoDataFormProps {
  values: VideoData;
  onChange: (values: VideoData) => void;
  readOnly?: boolean;
  readOnlyFields?: Partial<Record<keyof VideoData, boolean>>;
  inputVariant?: "flat" | "bordered" | "underlined" | "faded";
  className?: string;
  mediaTypeOptions?: Array<{ label: string; value: string }>;
  ownerOptions?: Array<{ label: string; value: string }>;
  genreOptions?: Array<{ label: string; value: string }>;
}

function dateValueToJS(dateValue: DateValue | null): Date | null {
  if (!dateValue) return null;
  const { year, month, day } = dateValue;
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

function dateToDateValue(date: Date | null | undefined): DateValue | null {
  if (!date) return null;
  return parseDate(date.toISOString().split("T")[0]);
}

function useBufferedValue<T>(value: T, onCommit: (v: T) => void) {
  const [local, setLocal] = React.useState<T>(value);
  const lastValueRef = React.useRef(value);

  React.useEffect(() => {
    if (!Object.is(lastValueRef.current, value)) {
      lastValueRef.current = value;
      setLocal(value);
    }
  }, [value]);

  return {
    value: local,
    setValue: setLocal,
    commit: () => onCommit(local),
  };
}

export const UpsertVideoDataForm: React.FC<UpsertVideoDataFormProps> = ({
  values,
  onChange,
  readOnly = false,
  readOnlyFields,
  inputVariant = "underlined",
  className,
  mediaTypeOptions = [],
  ownerOptions = [],
  genreOptions = [],
}) => {
  const set = (patch: Partial<VideoData>) =>
    onChange({ ...values, ...patch });

  const ro = (k: keyof VideoData) => readOnly || !!readOnlyFields?.[k];

  const TextField = ({
    k,
    label,
    type = "text",
  }: {
    k: keyof VideoData;
    label: string;
    type?: string;
  }) => {
    const { value, setValue, commit } = useBufferedValue(
      (values[k] ?? "") as any,
      (v) => set({ [k]: type === "number" && v !== "" ? Number(v) : v } as Partial<VideoData>)
    );

    return (
      <Input
        data-testid={`video-field-${String(k)}`}
        label={label}
        type={type}
        value={value?.toString() ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value)
        }
        onBlur={commit}
        isDisabled={ro(k)}
        variant={inputVariant}
        size="lg"
      />
    );
  };

  const TextAreaField = ({
    k,
    label,
    rows = 2,
  }: {
    k: keyof VideoData;
    label: string;
    rows?: number;
  }) => {
    const { value, setValue, commit } = useBufferedValue(
      (values[k] ?? "") as any,
      (v) => set({ [k]: v } as Partial<VideoData>)
    );

    return (
      <Textarea
        data-testid={`video-field-${String(k)}`}
        label={label}
        value={(value as string) ?? ""}
        onChange={(e: React.ChangeEvent<any>) =>
          setValue(e.target.value)
        }
        onBlur={commit}
        isDisabled={ro(k)}
        variant={inputVariant}
        minRows={rows}
      />
    );
  };

  const DateField = ({ k, label }: { k: keyof VideoData; label: string }) => {
    const memoizedValue = React.useMemo(
      () => dateToDateValue(values[k] as Date | null),
      [values[k]]
    );
    const { value, setValue, commit } = useBufferedValue<DateValue | null>(
      memoizedValue,
      (v) => set({ [k]: dateValueToJS(v) } as Partial<VideoData>)
    );

    return (
      <DatePicker
        data-testid={`video-field-${String(k)}`}
        label={label}
        value={value}
        onChange={setValue}
        onBlur={commit}
        isDisabled={ro(k)}
        granularity="day"
        showMonthAndYearPickers
        className="max-w-[284px]"
      />
    );
  };

  const SingleSelect = (
    k: keyof VideoData,
    label: string,
    options: { label: string; value: string }[]
  ) => (
    <Select
      data-testid={`video-field-${String(k)}`}
      label={label}
      selectedKeys={
        values[k] != null ? new Set([String(values[k])]) : new Set<string>()
      }
      onSelectionChange={(selection: Selection) => {
        if (selection === "all") return;
        const key = Array.from(selection)[0];
        set({ [k]: key ? Number(key) : null } as Partial<VideoData>);
      }}
      isDisabled={ro(k)}
      variant={inputVariant}
      size="lg"
    >
      {options.map((o) => (
        <SelectItem key={o.value}>{o.label}</SelectItem>
      ))}
    </Select>
  );

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField k="id" label="ID" type="number" />
        <TextField k="md5" label="MD5" />

        <TextField k="title" label="Title" />
        <TextField k="subtitle" label="Subtitle" />

        <TextField k="language" label="Language" />
        <TextField k="diskid" label="Disk ID" />

        <TextAreaField k="comment" label="Comment" />
        <TextField k="disklabel" label="Disk Label" />

        <TextField k="imdbID" label="IMDB ID" />
        <TextField k="year" label="Year" type="number" />

        <TextField k="imgurl" label="Image URL" />
        <TextField k="director" label="Director" />

        <TextAreaField k="actors" label="Actors" />
        <TextField k="runtime" label="Runtime (min)" type="number" />

        <TextField k="country" label="Country" />
        <TextAreaField k="plot" label="Plot" rows={3} />

        <TextField k="rating" label="Rating" />
        <TextField k="filename" label="Filename" />

        <TextField k="filesize" label="Filesize (bytes)" type="number" />

        <DateField k="filedate" label="File Date" />

        <TextField k="audio_codec" label="Audio Codec" />
        <TextField k="video_codec" label="Video Codec" />

        <TextField k="video_width" label="Video Width" type="number" />
        <TextField k="video_height" label="Video Height" type="number" />

        <TextField k="istv" label="Is TV (0/1)" type="number" />

        <DateField k="lastupdate" label="Last Update" />

        {SingleSelect("mediatype", "Media Type", mediaTypeOptions)}

        <TextField k="custom1" label="Custom 1" />
        <TextField k="custom2" label="Custom 2" />
        <TextField k="custom3" label="Custom 3" />
        <TextField k="custom4" label="Custom 4" />

        <DateField k="created" label="Created" />

        {SingleSelect("owner_id", "Owner", ownerOptions)}

        <Select
          data-testid="video-field-genres"
          label="Genres"
          selectionMode="multiple"
          selectedKeys={
            values.genreIds?.length
              ? new Set(values.genreIds.map(String))
              : new Set<string>()
          }
          onSelectionChange={(selection: Selection) => {
            if (selection === "all") {
              set({
                genreIds: genreOptions.map((o) => Number(o.value)),
              });
              return;
            }
            set({
              genreIds: Array.from(selection).map((k) => Number(k)),
            });
          }}
          isDisabled={ro("genreIds")}
          variant={inputVariant}
          size="lg"
        >
          {genreOptions.map((o) => (
            <SelectItem key={o.value}>{o.label}</SelectItem>
          ))}
        </Select>
      </div>
      <Spacer y={4} />
    </div>
  );
};

export default UpsertVideoDataForm;

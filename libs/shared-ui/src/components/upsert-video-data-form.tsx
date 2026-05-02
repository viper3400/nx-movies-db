"use client";

import React from "react";
import {
  Checkbox,
  Button,
  Input,
  Textarea,
  DatePicker,
  DateValue,
  Spacer,
  Select,
  SelectItem,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import {
  isPhysicalMediaTypeName,
  isValidDiskId,
  normalizeDiskId,
  VideoData,
} from "@nx-movies-db/shared-types";
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
  diskIdSuggestion?: string | null;
  isDiskIdSuggestionLoading?: boolean;
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
  diskIdSuggestion,
  isDiskIdSuggestionLoading = false,
}) => {
  const set = (patch: Partial<VideoData>) =>
    onChange({ ...values, ...patch });

  const ro = (k: keyof VideoData) => readOnly || !!readOnlyFields?.[k];
  const selectedMediaTypeName = mediaTypeOptions.find((o) => o.value === String(values.mediatype))?.label;
  const diskIdRequired = isPhysicalMediaTypeName(selectedMediaTypeName);
  const normalizedDiskId = normalizeDiskId(values.diskid);
  const diskIdInvalidFormat = !!normalizedDiskId && !isValidDiskId(normalizedDiskId);
  const diskIdMissing = diskIdRequired && !normalizedDiskId;
  const diskIdInvalid = diskIdInvalidFormat || diskIdMissing;
  const diskIdSuggestionToShow =
    diskIdSuggestion && diskIdSuggestion !== normalizedDiskId ? diskIdSuggestion : null;

  const renderTextField = ({
    k,
    label,
    type = "text",
  }: {
    k: keyof VideoData;
    label: string;
    type?: string;
  }) => (
    <Input
      data-testid={`video-field-${String(k)}`}
      label={label}
      type={type}
      value={
        values[k] === null || values[k] === undefined
          ? ""
          : values[k]?.toString() ?? ""
      }
      onValueChange={(value) =>
        set({
          [k]:
            type === "number"
              ? value === "" || value == null
                ? null
                : Number(value)
              : value,
        } as Partial<VideoData>)
      }
      isDisabled={ro(k)}
      variant={inputVariant}
      size="lg"
    />
  );

  const renderDiskIdField = () => (
    <Input
      data-testid="video-field-diskid"
      label="Disk ID"
      value={values.diskid ?? ""}
      onValueChange={(value) => set({ diskid: value })}
      isDisabled={ro("diskid")}
      variant={inputVariant}
      size="lg"
      isInvalid={diskIdInvalid}
      errorMessage={
        diskIdMissing
          ? "Disk ID is required for physical media."
          : diskIdInvalidFormat
            ? "Use RxxFyDzz, for example R01F3D04."
            : undefined
      }
      description={
        !diskIdInvalid && !diskIdSuggestionToShow && isDiskIdSuggestionLoading
          ? "Checking next free Disk ID..."
          : undefined
      }
      endContent={
        diskIdSuggestionToShow && !ro("diskid") ? (
          <Button
            data-testid="video-field-diskid-suggestion"
            size="sm"
            variant="flat"
            onPress={() => set({ diskid: diskIdSuggestionToShow })}
          >
            {diskIdSuggestionToShow}
          </Button>
        ) : null
      }
    />
  );

  const renderTextAreaField = ({
    k,
    label,
    rows = 2,
  }: {
    k: keyof VideoData;
    label: string;
    rows?: number;
  }) => (
    <Textarea
      data-testid={`video-field-${String(k)}`}
      label={label}
      value={(values[k] as string) ?? ""}
      onValueChange={(value) =>
        set({
          [k]: value,
        } as Partial<VideoData>)
      }
      isDisabled={ro(k)}
      variant={inputVariant}
      minRows={rows}
    />
  );

  const renderDateField = ({ k, label }: { k: keyof VideoData; label: string }) => (
    <DatePicker
      data-testid={`video-field-${String(k)}`}
      label={label}
      value={dateToDateValue(values[k] as Date | null | undefined)}
      onChange={(date) =>
        set({
          [k]: dateValueToJS(date),
        } as Partial<VideoData>)
      }
      isDisabled={ro(k)}
      granularity="day"
      showMonthAndYearPickers
      className="max-w-[284px]"
    />
  );

  const renderCheckboxField = ({ k, label }: { k: keyof VideoData; label: string }) => (
    <Checkbox
      data-testid={`video-field-${String(k)}`}
      isSelected={values[k] === 1}
      onValueChange={(selected) =>
        set({
          [k]: selected ? 1 : 0,
        } as Partial<VideoData>)
      }
      isDisabled={ro(k)}
      className="min-h-14 items-center"
    >
      {label}
    </Checkbox>
  );

  const renderSingleSelect = (
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
        {renderTextField({ k: "id", label: "ID", type: "number" })}
        {renderTextField({ k: "md5", label: "MD5" })}

        {renderTextField({ k: "title", label: "Title" })}
        {renderTextField({ k: "subtitle", label: "Subtitle" })}

        {renderTextField({ k: "language", label: "Language" })}
        {renderDiskIdField()}

        {renderTextAreaField({ k: "comment", label: "Comment" })}
        {renderTextField({ k: "disklabel", label: "Disk Label" })}

        {renderTextField({ k: "imdbID", label: "IMDB ID" })}
        {renderTextField({ k: "year", label: "Year", type: "number" })}

        {renderTextField({ k: "imgurl", label: "Image URL" })}
        {renderTextField({ k: "director", label: "Director" })}

        {renderTextAreaField({ k: "actors", label: "Actors" })}
        {renderTextField({ k: "runtime", label: "Runtime (min)", type: "number" })}

        {renderTextField({ k: "country", label: "Country" })}
        {renderTextAreaField({ k: "plot", label: "Plot", rows: 3 })}

        {renderTextField({ k: "rating", label: "Rating" })}
        {renderTextField({ k: "filename", label: "Filename" })}

        {renderTextField({ k: "filesize", label: "Filesize (bytes)", type: "number" })}

        {renderDateField({ k: "filedate", label: "File Date" })}

        {renderTextField({ k: "audio_codec", label: "Audio Codec" })}
        {renderTextField({ k: "video_codec", label: "Video Codec" })}

        {renderTextField({ k: "video_width", label: "Video Width", type: "number" })}
        {renderTextField({ k: "video_height", label: "Video Height", type: "number" })}

        {renderCheckboxField({ k: "istv", label: "TV series" })}

        {renderDateField({ k: "lastupdate", label: "Last Update" })}

        {renderSingleSelect("mediatype", "Media Type", mediaTypeOptions)}

        {renderTextField({ k: "custom1", label: "Custom 1" })}
        {renderTextField({ k: "custom2", label: "Custom 2" })}
        {renderTextField({ k: "custom3", label: "Custom 3" })}
        {renderTextField({ k: "custom4", label: "Custom 4" })}

        {renderDateField({ k: "created", label: "Created" })}

        {renderSingleSelect("owner_id", "Owner", ownerOptions)}

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

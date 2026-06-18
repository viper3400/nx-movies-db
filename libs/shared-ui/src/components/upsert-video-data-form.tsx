"use client";

import React from "react";
import {
  Button,
  Checkbox,
  DateField,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui-v3/react";
import { parseDate, type DateValue } from "@internationalized/date";
import {
  isPhysicalMediaTypeName,
  isValidDiskId,
  normalizeDiskId,
  VideoData,
} from "@nx-movies-db/shared-types";

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
  const inputVariantV3 = inputVariant === "flat" || inputVariant === "bordered" ? "primary" : "secondary";

  const renderTextField = ({
    k,
    label,
    type = "text",
  }: {
    k: keyof VideoData;
    label: string;
    type?: string;
  }) => (
    <TextField isDisabled={ro(k)} name={String(k)} type={type}>
      <Label>{label}</Label>
      <Input
        data-testid={`video-field-${String(k)}`}
        type={type}
        value={
          values[k] === null || values[k] === undefined
            ? ""
            : values[k]?.toString() ?? ""
        }
        onChange={(event) => {
          const value = event.target.value;
          set({
            [k]:
              type === "number"
                ? value === "" || value == null
                  ? null
                  : Number(value)
                : value,
          } as Partial<VideoData>);
        }}
        variant={inputVariantV3}
      />
    </TextField>
  );

  const renderDiskIdField = () => (
    <TextField isDisabled={ro("diskid")} isInvalid={diskIdInvalid} name="diskid">
      <Label>Disk ID</Label>
      <InputGroup variant={inputVariantV3}>
        <InputGroup.Input
          data-testid="video-field-diskid"
          value={values.diskid ?? ""}
          onChange={(event) => set({ diskid: event.target.value })}
        />
        {diskIdSuggestionToShow && !ro("diskid") ? (
          <InputGroup.Suffix>
            <Button
              data-testid="video-field-diskid-suggestion"
              size="sm"
              variant="secondary"
              onPress={() => set({ diskid: diskIdSuggestionToShow })}
            >
              {diskIdSuggestionToShow}
            </Button>
          </InputGroup.Suffix>
        ) : null}
      </InputGroup>
      {!diskIdInvalid && !diskIdSuggestionToShow && isDiskIdSuggestionLoading ? (
        <Description>Checking next free Disk ID...</Description>
      ) : null}
      <FieldError>
        {diskIdMissing
          ? "Disk ID is required for physical media."
          : diskIdInvalidFormat
            ? "Use RxxFyDzz, for example R01F3D04."
            : undefined}
      </FieldError>
    </TextField>
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
    <TextField isDisabled={ro(k)} name={String(k)}>
      <Label>{label}</Label>
      <TextArea
        data-testid={`video-field-${String(k)}`}
        value={(values[k] as string) ?? ""}
        onChange={(event) =>
          set({
            [k]: event.target.value,
          } as Partial<VideoData>)
        }
        rows={rows}
        variant={inputVariantV3}
      />
    </TextField>
  );

  const renderDateField = ({ k, label }: { k: keyof VideoData; label: string }) => (
    <div className="flex max-w-[284px] flex-col gap-1">
      <span className="text-sm">{label}</span>
      <DateField
        aria-label={label}
        value={dateToDateValue(values[k] as Date | null | undefined)}
        onChange={(date) =>
          set({
            [k]: dateValueToJS(date),
          } as Partial<VideoData>)
        }
        isDisabled={ro(k)}
        granularity="day"
      >
        <DateField.Group data-testid={`video-field-${String(k)}`} variant={inputVariantV3}>
          <DateField.Input>
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
        </DateField.Group>
      </DateField>
    </div>
  );

  const renderCheckboxField = ({ k, label }: { k: keyof VideoData; label: string }) => (
    <Checkbox
      data-testid={`video-field-${String(k)}`}
      isSelected={values[k] === 1}
      onChange={(selected) =>
        set({
          [k]: selected ? 1 : 0,
        } as Partial<VideoData>)
      }
      isDisabled={ro(k)}
      className="min-h-14 items-center"
    >
      <Checkbox.Content>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        {label}
      </Checkbox.Content>
    </Checkbox>
  );

  const renderSingleSelect = (
    k: keyof VideoData,
    label: string,
    options: { label: string; value: string }[]
  ) => (
    <Select
      placeholder={`Select ${label}`}
      value={values[k] != null ? String(values[k]) : null}
      onChange={(selection) => {
        const key = selection as string | null;
        set({ [k]: key ? Number(key) : null } as Partial<VideoData>);
      }}
      isDisabled={ro(k)}
      variant={inputVariantV3}
    >
      <Label>{label}</Label>
      <Select.Trigger data-testid={`video-field-${String(k)}`}>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((o) => (
            <ListBox.Item id={o.value} key={o.value} textValue={o.label}>
              {o.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );

  return (
    <div className={`pb-4 ${className ?? ""}`.trim()}>
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

        {renderTextAreaField({ k: "actors", label: "Actors", rows: 3 })}
        {renderTextAreaField({ k: "plot", label: "Plot", rows: 3 })}

        {renderTextField({ k: "runtime", label: "Runtime (min)", type: "number" })}
        {renderTextField({ k: "country", label: "Country" })}


        {renderTextField({ k: "rating", label: "Rating" })}
        {renderTextField({ k: "filename", label: "Filename" })}

        {renderTextField({ k: "filesize", label: "Filesize (bytes)", type: "number" })}

        {renderDateField({ k: "filedate", label: "File Date" })}

        {renderTextField({ k: "audio_codec", label: "Audio Codec" })}
        {renderTextField({ k: "video_codec", label: "Video Codec" })}

        {renderTextField({ k: "video_width", label: "Video Width", type: "number" })}
        {renderTextField({ k: "video_height", label: "Video Height", type: "number" })}

        {renderCheckboxField({ k: "istv", label: "TV series" })}
        {renderSingleSelect("mediatype", "Media Type", mediaTypeOptions)}

        {renderSingleSelect("owner_id", "Owner", ownerOptions)}

        <Select
          placeholder="Select genres"
          selectionMode="multiple"
          value={values.genreIds?.map(String) ?? []}
          onChange={(selection) => {
            const nextSelection = Array.isArray(selection)
              ? selection
              : selection
                ? [selection]
                : [];
            set({
              genreIds: nextSelection.map((key) => Number(key)),
            });
          }}
          isDisabled={ro("genreIds")}
          variant={inputVariantV3}
        >
          <Label>Genres</Label>
          <Select.Trigger data-testid="video-field-genres">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {genreOptions.map((o) => (
                <ListBox.Item id={o.value} key={o.value} textValue={o.label}>
                  {o.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        {renderTextField({ k: "custom1", label: "Custom 1" })}
        {renderTextField({ k: "custom2", label: "Custom 2" })}
        {renderTextField({ k: "custom3", label: "Custom 3" })}
        {renderTextField({ k: "custom4", label: "Custom 4" })}

        {renderDateField({ k: "created", label: "Created" })}
        {renderDateField({ k: "lastupdate", label: "Last Update" })}

      </div>
    </div>
  );
};

export default UpsertVideoDataForm;

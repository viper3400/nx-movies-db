"use client";

import React from "react";
import {
  Button,
  Checkbox,
  Chip,
  Image,
} from "@heroui/react";
import type { Selection } from "@react-types/shared";
import {
  TmdbGenreMappingControl,
  type TmdbGenreMappingMatch,
} from "./tmdb-genre-mapping-control";

export interface TmdbMetadataMergeCandidateView {
  field: string;
  label: string;
  currentValue: unknown;
  tmdbValue: unknown;
  selected: boolean;
  conflict: boolean;
  reason: "empty-local" | "different-local" | "different-tmdb-reference";
}

export interface TmdbBackdropCandidateView {
  filePath: string;
  url: string;
  width: number | null;
  height: number | null;
  voteAverage: number | null;
  voteCount: number | null;
  iso639_1: string | null;
  isPrimary: boolean;
}

export interface TmdbMetadataMergePanelProps {
  candidates: TmdbMetadataMergeCandidateView[];
  tmdbImdbId?: string | null;
  backdropCandidates?: TmdbBackdropCandidateView[];
  selectedBackdropUrl?: string | null;
  genreMatches?: TmdbGenreMappingMatch[];
  availableGenres?: Array<{ label: string; value: string }>;
  loadingGenres?: boolean;
  genresErrorMessage?: string | null;
  genrePickerTmdbGenre?: string | null;
  onCandidateSelectionChange: (field: string, selected: boolean) => void;
  onBackdropSelectionChange?: (url: string) => void;
  onUnmappedGenrePress?: (tmdbGenre: string) => void;
  onManualGenreSelection?: (selection: Selection) => void;
  onApplySelected: () => void;
  onNoMatch: () => void;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Empty";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Empty";
  if (typeof value === "number") return String(value);
  return String(value);
}

function getReasonLabel(candidate: TmdbMetadataMergeCandidateView): string {
  if (candidate.reason === "different-tmdb-reference") return "Different TMDB reference";
  if (candidate.conflict) return "Needs review";
  return "Empty local field";
}

export const TmdbMetadataMergePanel: React.FC<TmdbMetadataMergePanelProps> = ({
  candidates,
  tmdbImdbId,
  backdropCandidates = [],
  selectedBackdropUrl,
  genreMatches = [],
  availableGenres = [],
  loadingGenres = false,
  genresErrorMessage,
  genrePickerTmdbGenre,
  onCandidateSelectionChange,
  onBackdropSelectionChange,
  onUnmappedGenrePress,
  onManualGenreSelection,
  onApplySelected,
  onNoMatch,
}) => {
  const selectedCount = candidates.filter((candidate) => candidate.selected).length;

  return (
    <div
      data-testid="tmdb-metadata-merge-panel"
      className="space-y-3 rounded-small border border-default-200 p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">TMDB metadata update</h2>
          {tmdbImdbId && (
            <p data-testid="tmdb-real-imdb-id" className="text-sm text-default-500">
              IMDb: {tmdbImdbId}
            </p>
          )}
        </div>
        <Chip size="sm" variant="flat" color={selectedCount ? "primary" : "default"}>
          {selectedCount} selected
        </Chip>
      </div>

      {candidates.length === 0 ? (
        <p data-testid="tmdb-merge-no-differences" className="text-sm text-default-500">
          No metadata differences found.
        </p>
      ) : (
        <div className="space-y-2">
          {backdropCandidates.length > 1 && (
            <div
              data-testid="tmdb-backdrop-picker"
              className="rounded-small border border-default-200 p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Background</h3>
                <Chip size="sm" variant="flat">
                  {backdropCandidates.length} options
                </Chip>
              </div>
              <div className="grid max-h-[42rem] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
                {backdropCandidates.map((backdrop, index) => {
                  const isSelected = backdrop.url === selectedBackdropUrl;
                  return (
                    <button
                      key={backdrop.filePath}
                      data-testid={`tmdb-backdrop-option-${index}`}
                      type="button"
                      className={`overflow-hidden rounded-small border p-1 text-left transition ${isSelected ? "border-primary bg-primary/10" : "border-default-200"}`}
                      onClick={() => onBackdropSelectionChange?.(backdrop.url)}
                    >
                      <Image
                        src={backdrop.url}
                        alt=""
                        width={320}
                        height={180}
                        radius="sm"
                        className="aspect-video h-auto w-full object-cover"
                      />
                      <div className="mt-2 px-1 pb-1 text-xs text-default-500">
                        {backdrop.isPrimary ? "Primary background" : "Alternate background"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {candidates.map((candidate) => (
            <div
              key={candidate.field}
              data-testid={`tmdb-merge-candidate-${candidate.field}`}
              className="rounded-small border border-default-200 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Checkbox
                  data-testid={`tmdb-merge-select-${candidate.field}`}
                  isSelected={candidate.selected}
                  onValueChange={(selected) => onCandidateSelectionChange(candidate.field, selected)}
                >
                  {candidate.label}
                </Checkbox>
                <Chip
                  size="sm"
                  variant="flat"
                  color={candidate.conflict ? "warning" : "success"}
                >
                  {getReasonLabel(candidate)}
                </Chip>
              </div>
              <dl className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-default-500">Current</dt>
                  <dd className="max-h-24 overflow-auto whitespace-pre-wrap break-words">
                    {formatValue(candidate.currentValue)}
                  </dd>
                </div>
                <div>
                  <dt className="text-default-500">TMDB</dt>
                  <dd className="max-h-24 overflow-auto whitespace-pre-wrap break-words">
                    {formatValue(candidate.tmdbValue)}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}

      {genreMatches.length > 0 && (
        <TmdbGenreMappingControl
          genreMatches={genreMatches}
          availableGenres={availableGenres}
          loadingGenres={loadingGenres}
          genresErrorMessage={genresErrorMessage}
          genrePickerTmdbGenre={genrePickerTmdbGenre}
          testIdPrefix="tmdb-merge-genre"
          manualSelectTestId="tmdb-merge-manual-genre-select"
          onUnmappedGenrePress={onUnmappedGenrePress}
          onManualGenreSelection={onManualGenreSelection}
        />
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          data-testid="tmdb-merge-no-match"
          variant="flat"
          onPress={onNoMatch}
        >
          No TMDB match
        </Button>
        <Button
          data-testid="tmdb-merge-apply"
          color="primary"
          isDisabled={selectedCount === 0}
          onPress={onApplySelected}
        >
          Apply selected
        </Button>
      </div>
    </div>
  );
};

export default TmdbMetadataMergePanel;

"use client";

import React from "react";
import {
  Button,
  Checkbox,
  Chip,
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

export interface TmdbMetadataMergePanelProps {
  candidates: TmdbMetadataMergeCandidateView[];
  tmdbImdbId?: string | null;
  genreMatches?: TmdbGenreMappingMatch[];
  availableGenres?: Array<{ label: string; value: string }>;
  loadingGenres?: boolean;
  genresErrorMessage?: string | null;
  genrePickerTmdbGenre?: string | null;
  onCandidateSelectionChange: (field: string, selected: boolean) => void;
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
  genreMatches = [],
  availableGenres = [],
  loadingGenres = false,
  genresErrorMessage,
  genrePickerTmdbGenre,
  onCandidateSelectionChange,
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

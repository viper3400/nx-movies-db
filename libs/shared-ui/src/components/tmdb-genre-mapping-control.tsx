"use client";

import React from "react";
import {
  Chip,
  Select,
  SelectItem,
} from "@heroui/react";
import type { Selection } from "@react-types/shared";

export interface TmdbGenreMappingMatch {
  tmdbGenre: string;
  localGenre?: string;
  localGenreId?: number;
  mappedByAlias: boolean;
  mappedByManualOverride: boolean;
}

export interface TmdbGenreMappingControlProps {
  genreMatches: TmdbGenreMappingMatch[];
  availableGenres: Array<{ label: string; value: string }>;
  loadingGenres?: boolean;
  genresErrorMessage?: string | null;
  genrePickerTmdbGenre?: string | null;
  testIdPrefix?: string;
  heading?: string;
  manualSelectTestId?: string;
  onUnmappedGenrePress?: (tmdbGenre: string) => void;
  onManualGenreSelection?: (selection: Selection) => void;
}

function getGenreChipColor(match: TmdbGenreMappingMatch) {
  if (match.mappedByManualOverride) return "success";
  if (!match.localGenreId) return "danger";
  if (match.mappedByAlias) return "warning";
  return "default";
}

function getGenreTestId(tmdbGenre: string) {
  return tmdbGenre.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const TmdbGenreMappingControl: React.FC<TmdbGenreMappingControlProps> = ({
  genreMatches,
  availableGenres,
  loadingGenres = false,
  genresErrorMessage,
  genrePickerTmdbGenre,
  testIdPrefix = "tmdb-genre",
  heading = "Genre mapping",
  manualSelectTestId = "tmdb-manual-genre-select",
  onUnmappedGenrePress,
  onManualGenreSelection,
}) => {
  return (
    <div data-testid={`${testIdPrefix}-mapping`} className="space-y-2">
      {heading && <h3 className="text-sm font-medium">{heading}</h3>}
      <div className="flex flex-wrap gap-1">
        {genreMatches.length
          ? genreMatches.map((match) => {
            const canOpenGenrePicker = Boolean(onUnmappedGenrePress) && !loadingGenres;
            return (
              <button
                key={match.tmdbGenre}
                data-testid={`${testIdPrefix}-${getGenreTestId(match.tmdbGenre)}`}
                type="button"
                onClick={() => {
                  if (canOpenGenrePicker) {
                    onUnmappedGenrePress?.(match.tmdbGenre);
                  }
                }}
                className={canOpenGenrePicker ? "cursor-pointer" : "cursor-default"}
                disabled={!canOpenGenrePicker}
              >
                <Chip
                  size="sm"
                  variant="flat"
                  color={getGenreChipColor(match)}
                >
                  {match.localGenre && match.localGenre !== match.tmdbGenre
                    ? `${match.tmdbGenre} -> ${match.localGenre}`
                    : match.tmdbGenre}
                </Chip>
              </button>
            );
          })
          : <span className="text-sm text-default-500">n/a</span>}
      </div>

      {genrePickerTmdbGenre && (
        <Select
          data-testid={manualSelectTestId}
          label={`Map ${genrePickerTmdbGenre}`}
          selectedKeys={new Set<string>()}
          onSelectionChange={onManualGenreSelection}
          isDisabled={loadingGenres}
          variant="faded"
          size="sm"
        >
          {availableGenres.map((genre) => (
            <SelectItem key={genre.value}>{genre.label}</SelectItem>
          ))}
        </Select>
      )}

      {genresErrorMessage && (
        <p className="text-sm text-warning-600">{genresErrorMessage}</p>
      )}
    </div>
  );
};

export default TmdbGenreMappingControl;

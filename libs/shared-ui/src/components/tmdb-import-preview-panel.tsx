"use client";

import React from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Image,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import type { Selection } from "@react-types/shared";
import type { VideoData } from "@nx-movies-db/shared-types";
import type { CheckboxValue } from "../interfaces";

export type TmdbImportPreviewMediaKind = "movie" | "tv";

export interface TmdbImportSelectedMoviePreview {
  mediaKind: TmdbImportPreviewMediaKind;
  posterUrl: string | null;
  imdbId: string | null;
}

export interface TmdbImportGenreMatch {
  tmdbGenre: string;
  localGenre?: string;
  localGenreId?: number;
  mappedByAlias: boolean;
  mappedByManualOverride: boolean;
}

export interface TmdbImportPreviewPanelProps {
  isLoading: boolean;
  selectedMoviePreview: TmdbImportSelectedMoviePreview | null;
  draft: VideoData | null;
  genreMatches: TmdbImportGenreMatch[];
  availableGenres: CheckboxValue[];
  loadingGenres: boolean;
  genresErrorMessage?: string | null;
  genrePickerTmdbGenre?: string | null;
  onUnmappedGenrePress?: (tmdbGenre: string) => void;
  onManualGenreSelection?: (selection: Selection) => void;
  onUseMetadata?: () => void;
}

function getGenreChipColor(match: TmdbImportGenreMatch) {
  if (match.mappedByManualOverride) return "success";
  if (!match.localGenreId) return "danger";
  if (match.mappedByAlias) return "warning";
  return "default";
}

function getGenreTestId(tmdbGenre: string) {
  return tmdbGenre.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const TmdbImportPreviewPanel: React.FC<TmdbImportPreviewPanelProps> = ({
  isLoading,
  selectedMoviePreview,
  draft,
  genreMatches,
  availableGenres,
  loadingGenres,
  genresErrorMessage,
  genrePickerTmdbGenre,
  onUnmappedGenrePress,
  onManualGenreSelection,
  onUseMetadata,
}) => {
  return (
    <div data-testid="tmdb-preview-panel" className="lg:sticky lg:top-20 lg:self-start">
      <Card shadow="sm" radius="sm">
        <CardBody className="space-y-3">
          {isLoading && (
            <div data-testid="tmdb-preview-loading" className="flex min-h-32 items-center justify-center">
              <Spinner label="Loading details..." />
            </div>
          )}

          {!isLoading && (!selectedMoviePreview || !draft) && (
            <p data-testid="tmdb-preview-empty" className="text-sm text-default-500">Select a movie to preview imported fields.</p>
          )}

          {!isLoading && selectedMoviePreview && draft && (
            <>
              <div data-testid="tmdb-preview-selected-movie" className="flex gap-3">
                {selectedMoviePreview.posterUrl ? (
                  <Image
                    src={selectedMoviePreview.posterUrl}
                    alt=""
                    width={92}
                    height={138}
                    radius="sm"
                    className="h-[138px] w-[92px] object-cover"
                  />
                ) : (
                  <div className="h-[138px] w-[92px] shrink-0 rounded-small bg-default-100" />
                )}
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold leading-6">{draft.title}</h2>
                  <p className="text-sm text-default-500">
                    {selectedMoviePreview.mediaKind === "tv" ? "TV series" : "Movie"} - {draft.year}
                  </p>
                  {selectedMoviePreview.imdbId && (
                    <p className="text-sm text-default-500">{selectedMoviePreview.imdbId}</p>
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-[92px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                <dt className="text-default-500">Runtime</dt>
                <dd>{draft.runtime ?? "n/a"}</dd>
                <dt className="text-default-500">Rating</dt>
                <dd>{draft.rating || "n/a"}</dd>
                <dt className="text-default-500">Country</dt>
                <dd>{draft.country || "n/a"}</dd>
                <dt className="text-default-500">Director</dt>
                <dd className="whitespace-pre-line">{draft.director || "n/a"}</dd>
                <dt className="text-default-500">Genres</dt>
                <dd className="flex flex-wrap gap-1">
                  {genreMatches.length
                    ? genreMatches.map((match) => {
                      const canOpenGenrePicker = Boolean(onUnmappedGenrePress) && !loadingGenres;
                      return (
                        <button
                          key={match.tmdbGenre}
                          data-testid={`tmdb-preview-genre-${getGenreTestId(match.tmdbGenre)}`}
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
                    : "n/a"}
                </dd>
              </dl>

              {genrePickerTmdbGenre && (
                <Select
                  data-testid="tmdb-manual-genre-select"
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

              <Button
                data-testid="tmdb-use-metadata"
                color="primary"
                onPress={onUseMetadata}
                isDisabled={loadingGenres}
              >
                Use metadata
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default TmdbImportPreviewPanel;

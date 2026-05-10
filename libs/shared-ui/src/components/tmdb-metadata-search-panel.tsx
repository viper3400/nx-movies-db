"use client";

import React from "react";
import {
  Button,
  Switch,
} from "@heroui/react";
import { MovieSearchInput } from "./movie-search-input";
import { TmdbSearchResultsList } from "./tmdb-search-results-list";
import type { TmdbSearchResultItem } from "./tmdb-search-result-card";

export type TmdbMetadataSearchMediaKind = "movie" | "tv";

export interface TmdbMetadataSearchPanelProps {
  query: string;
  mediaKind: TmdbMetadataSearchMediaKind;
  results: TmdbSearchResultItem[];
  isSearching: boolean;
  hasSearched: boolean;
  errorMessage?: string | null;
  onQueryChange: (query: string) => void;
  onMediaKindChange: (mediaKind: TmdbMetadataSearchMediaKind) => void;
  onSearch: () => void;
  onSelect: (result: TmdbSearchResultItem) => void;
  queryTestId?: string;
  mediaKindTestId?: string;
  submitTestId?: string;
  selectLabel?: string;
}

export const TmdbMetadataSearchPanel: React.FC<TmdbMetadataSearchPanelProps> = ({
  query,
  mediaKind,
  results,
  isSearching,
  hasSearched,
  errorMessage,
  onQueryChange,
  onMediaKindChange,
  onSearch,
  onSelect,
  queryTestId = "tmdb-search-query",
  mediaKindTestId = "tmdb-media-kind-switch",
  submitTestId = "tmdb-search-submit",
  selectLabel = "Review",
}) => {
  return (
    <div data-testid="tmdb-metadata-search-panel" className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row">
        <MovieSearchInput
          dataTestId={queryTestId}
          searchText={query}
          onSearchTextChange={onQueryChange}
          invalidSearch={false}
          onClearSearch={() => onQueryChange("")}
          totalMoviesCount={results.length}
          langResources={{
            placeholderLabel: mediaKind === "tv" ? "Search TMDB TV title..." : "Search TMDB movie title...",
            searchLabel: mediaKind === "tv" ? "TMDB TV title" : "TMDB movie title",
            resultCountLabel: "Results",
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearch();
            }
          }}
        />
        <Switch
          data-testid={mediaKindTestId}
          isSelected={mediaKind === "tv"}
          onValueChange={(selected) => onMediaKindChange(selected ? "tv" : "movie")}
          className="md:self-end"
        >
          TV series
        </Switch>
        <Button
          data-testid={submitTestId}
          color="primary"
          size="lg"
          isLoading={isSearching}
          isDisabled={!query.trim()}
          onPress={onSearch}
          className="md:self-end"
        >
          Search
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-small border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
          {errorMessage}
        </div>
      )}

      <TmdbSearchResultsList
        results={results}
        isLoading={isSearching}
        hasSearched={hasSearched}
        onSelect={onSelect}
        selectLabel={selectLabel}
      />
    </div>
  );
};

export default TmdbMetadataSearchPanel;

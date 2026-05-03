"use client";

import React from "react";
import { Spinner } from "@heroui/react";
import {
  TmdbSearchResultCard,
  type TmdbSearchResultItem,
} from "./tmdb-search-result-card";

export interface TmdbSearchResultsListProps {
  results: TmdbSearchResultItem[];
  isLoading: boolean;
  hasSearched: boolean;
  onSelect?: (result: TmdbSearchResultItem) => void;
  loadingLabel?: string;
  emptyLabel?: string;
  selectLabel?: string;
}

export const TmdbSearchResultsList: React.FC<TmdbSearchResultsListProps> = ({
  results,
  isLoading,
  hasSearched,
  onSelect,
  loadingLabel = "Searching TMDB...",
  emptyLabel = "No TMDB results.",
  selectLabel = "Select",
}) => {
  return (
    <div data-testid="tmdb-results-list" className="space-y-3">
      {isLoading && (
        <div data-testid="tmdb-results-loading" className="flex min-h-32 items-center justify-center">
          <Spinner label={loadingLabel} />
        </div>
      )}

      {!isLoading && results.map((result) => (
        <TmdbSearchResultCard
          key={result.id}
          result={result}
          onSelect={onSelect}
          selectLabel={selectLabel}
        />
      ))}

      {!isLoading && hasSearched && results.length === 0 && (
        <p data-testid="tmdb-results-empty" className="text-sm text-default-500">{emptyLabel}</p>
      )}
    </div>
  );
};

export default TmdbSearchResultsList;

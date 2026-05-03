import { Input } from "@heroui/react";
import React from "react";

export interface MovieSearchInputLangResources {
  placeholderLabel: string;
  searchLabel: string;
  resultCountLabel: string;
}

export interface MovieSearchInputProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  invalidSearch: boolean;
  onClearSearch: () => void;
  totalMoviesCount: number;
  langResources: MovieSearchInputLangResources;
  dataTestId?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export const MovieSearchInput: React.FC<MovieSearchInputProps> = ({
  searchText,
  onSearchTextChange,
  invalidSearch,
  onClearSearch,
  totalMoviesCount,
  langResources,
  dataTestId,
  onKeyDown,
}) => {
  return (
    <Input
      isClearable
      errorMessage="Search must have at least 3 characters"
      isInvalid={invalidSearch}
      label={`${langResources.searchLabel} (${langResources.resultCountLabel}: ${totalMoviesCount})`}
      placeholder={langResources.placeholderLabel}
      type="text"
      size="lg"
      value={searchText}
      onValueChange={onSearchTextChange}
      onClear={onClearSearch}
      onKeyDown={onKeyDown}
      data-testid={dataTestId ?? "MovieSearchField"}
    />
  );
};

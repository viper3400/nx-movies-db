import { Input } from "@heroui/react";
import React from "react";

export interface MovieSearchInputLangResources {
  placeholderLabel: string;
  searchLabel: string;
  resultCountLabel: string;
}

interface MovieSearchInputProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  invalidSearch: boolean;
  onClearSearch: () => void;
  totalMoviesCount: number;
  langResources: MovieSearchInputLangResources;
}

export const MovieSearchInput: React.FC<MovieSearchInputProps> = ({
  searchText,
  onSearchTextChange,
  invalidSearch,
  onClearSearch,
  totalMoviesCount,
  langResources,
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
      data-test="MovieSearchField"
    />
  );
};

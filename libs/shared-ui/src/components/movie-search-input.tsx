import { CloseButton, FieldError, InputGroup, Label, TextField } from "@heroui-v3/react";
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
    <TextField className="w-full" isInvalid={invalidSearch} name="movie-search" type="text">
      <Label>{`${langResources.searchLabel} (${langResources.resultCountLabel}: ${totalMoviesCount})`}</Label>
      <InputGroup className="inline-flex w-full min-h-12 items-center" variant="secondary">
        <InputGroup.Input
          className="px-3 py-3 text-base"
          data-testid={dataTestId ?? "MovieSearchField"}
          placeholder={langResources.placeholderLabel}
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
          onKeyDown={onKeyDown}
        />
        {searchText ? (
          <InputGroup.Suffix className="px-3">
            <CloseButton aria-label="Clear search" onPress={onClearSearch} />
          </InputGroup.Suffix>
        ) : null}
      </InputGroup>
      <FieldError>{invalidSearch ? "Search must have at least 3 characters" : undefined}</FieldError>
    </TextField>
  );
};

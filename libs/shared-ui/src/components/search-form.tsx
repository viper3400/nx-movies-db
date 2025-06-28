import { Input } from "@heroui/react";
import React from "react";
import { CheckboxValue, FilterDrawer, MovieSearchFilters } from "..";


interface SearchFormLangResources {
  placeholderLabel: string;
  searchLabel: string;
  resultCountLabel: string;
}

interface SearchFormProps {
  searchText: string;
  setSearchText: (text: string) => void;
  invalidSearch: boolean;
  validateSearch: (text: string) => void;
  clearSearchResult: () => void;
  totalMoviesCount: number;
  filters: MovieSearchFilters;
  setFilters: (filters: MovieSearchFilters) => void;
  isDefaultFilter: boolean;
  handleSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  langResources: SearchFormLangResources;
  mediaTypes: CheckboxValue[];
  genres: CheckboxValue[];
}

export const SearchForm: React.FC<SearchFormProps> = ({
  searchText,
  setSearchText,
  invalidSearch,
  validateSearch,
  clearSearchResult,
  totalMoviesCount,
  filters,
  setFilters,
  isDefaultFilter,
  handleSearchSubmit,
  langResources,
  mediaTypes,
  genres,
}) => {
  return (
    <form onSubmit={handleSearchSubmit}>
      <div className="flex w-full flex-wrap md:flex-nowrap pb-4 gap-4 pr-4">
        <Input
          isClearable
          errorMessage="Search must have at least 3 characters"
          isInvalid={invalidSearch}
          label={`${langResources.searchLabel} (${langResources.resultCountLabel}: ${totalMoviesCount})`}
          placeholder={langResources.placeholderLabel}
          type="text"
          size="lg"
          value={searchText}
          onChange={(e) => {
            const value = e.target.value;
            setSearchText(value);
            if (invalidSearch) validateSearch(value);
          }}
          onClear={() => {
            clearSearchResult();
            setSearchText("");
          }}
        />
        <div className="place-content-center">
          <FilterDrawer
            filters={filters}
            setFilters={setFilters}
            isDefaultFilter={isDefaultFilter}
            mediaTypes={mediaTypes}
            genres={genres}
          />
        </div>
      </div>
    </form>
  );
};

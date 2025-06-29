import { Input, PressEvent } from "@heroui/react";
import React from "react";
import { CheckboxValue, FilterDrawer, MovieSearchFilters } from "..";
import { SurpriseButton } from "./surprise-button";


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
  handleRandomSearchRequest: (event: PressEvent) => void;
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
  handleRandomSearchRequest,
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
        <div className="flex place-content-center space-x-2">
          <div className="place-content-center ">
            <SurpriseButton onPress={handleRandomSearchRequest} />
          </div>
          <div className="place-content-center ">
            <FilterDrawer
              filters={filters}
              setFilters={setFilters}
              isDefaultFilter={isDefaultFilter}
              mediaTypes={mediaTypes}
              genres={genres}
            />
          </div>
        </div>
      </div>
    </form>
  );
};

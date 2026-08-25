import { PressEvent } from "@heroui/react";
import React from "react";
import { CheckboxValue, FilterDrawer, MovieSearchFilters } from "..";
import { MovieSearchInput, MovieSearchInputLangResources, MovieSearchSuggestion } from "./movie-search-input";
import { SurpriseButton } from "./surprise-button";


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
  langResources: MovieSearchInputLangResources;
  mediaTypes: CheckboxValue[];
  genres: CheckboxValue[];
  suggestions?: MovieSearchSuggestion[];
  suggestionsLoading?: boolean;
  onSuggestionSelect?: (suggestion: MovieSearchSuggestion) => void;
  autocompleteEnabled: boolean;
  onAutocompleteEnabledChange: (enabled: boolean) => void;
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
  suggestions,
  suggestionsLoading,
  onSuggestionSelect,
  autocompleteEnabled,
  onAutocompleteEnabledChange,
}) => {
  return (
    <form onSubmit={handleSearchSubmit}>
      <div className="flex w-full flex-wrap gap-4 pb-4 pr-4 md:flex-nowrap md:items-end">
        <MovieSearchInput
          searchText={searchText}
          onSearchTextChange={(value) => {
            setSearchText(value);
            if (invalidSearch) validateSearch(value);
          }}
          invalidSearch={invalidSearch}
          onClearSearch={() => {
            clearSearchResult();
            setSearchText("");
          }}
          totalMoviesCount={totalMoviesCount}
          langResources={langResources}
          suggestions={suggestions}
          suggestionsLoading={suggestionsLoading}
          onSuggestionSelect={onSuggestionSelect}
          autocompleteEnabled={autocompleteEnabled}
          onAutocompleteEnabledChange={onAutocompleteEnabledChange}
        />
        <div className="flex items-end gap-2 self-end md:pb-1">
          <div className="flex items-end">
            <SurpriseButton
              onPress={handleRandomSearchRequest}
              isDefaultFilter={isDefaultFilter}
              dataTestId="SurpriseButton" />
          </div>
          <div className="flex items-end">
            <FilterDrawer
              filters={filters}
              setFilters={setFilters}
              isDefaultFilter={isDefaultFilter}
              mediaTypes={mediaTypes}
              genres={genres}
              dataTestId="FilterDrawer"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

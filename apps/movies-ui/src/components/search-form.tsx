import { Input } from "@heroui/react";
import React from "react";
import { CheckboxValue, FilterDrawer } from "@nx-movies-db/shared-ui";

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
  deleteMode: string;
  setDeleteMode: (mode: string) => void;
  tvSeriesMode: string;
  setTvSeriesMode: (mode: string) => void;
  filterForFavorites: boolean;
  setFilterForFavorites: (value: boolean) => void;
  filterForWatchAgain: boolean;
  setFilterForWatchAgain: (value: boolean) => void;
  randomOrder: boolean;
  setRandomOrder: (value: boolean) => void;
  isDefaultFilter: boolean;
  handleSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  langResources: SearchFormLangResources;
  mediaTypes: CheckboxValue[];
  filterForMediaTypes: string[];
  setFilterForMediaTypes: (values: string[]) => void;
  genres: CheckboxValue[];
  filterForGenres: string[];
  setFilerForGenres: (values: string[]) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchText,
  setSearchText,
  invalidSearch,
  validateSearch,
  clearSearchResult,
  totalMoviesCount,
  deleteMode,
  setDeleteMode,
  tvSeriesMode,
  setTvSeriesMode,
  filterForFavorites,
  setFilterForFavorites,
  filterForWatchAgain,
  setFilterForWatchAgain,
  mediaTypes,
  filterForMediaTypes,
  setFilterForMediaTypes,
  genres,
  filterForGenres,
  setFilerForGenres,
  randomOrder,
  setRandomOrder,
  handleSearchSubmit,
  langResources,
  isDefaultFilter
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
            deleteMode={deleteMode}
            setDeleteMode={setDeleteMode}
            tvSeriesMode={tvSeriesMode}
            setTvSeriesMode={setTvSeriesMode}
            filterForFavorites={filterForFavorites}
            setFilterForFavorites={setFilterForFavorites}
            filterForWatchAgain={filterForWatchAgain}
            setFilterForWatchAgain={setFilterForWatchAgain}
            filterForRandomMovies={randomOrder}
            setFilterForRandomMovies={setRandomOrder}
            mediaTypes={mediaTypes}
            filterForMediaTypes={filterForMediaTypes}
            setFilterForMediaTypes={setFilterForMediaTypes}
            filterForGenres={filterForGenres}
            setFilterForGenres={setFilerForGenres}
            isDefaultFilter={isDefaultFilter}
            genres={genres} />
        </div>
      </div>
    </form >
  );
};

export default SearchForm;

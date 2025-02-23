import { Accordion, AccordionItem, Input, Radio, RadioGroup, Switch } from "@heroui/react";
import React from "react";

interface SearchFormLangResources {
  placeholderLabel: string;
  searchLabel: string;
  resultCountLabel: string;
  deletedMoviesFilterLabel: string;
  deletedMoviesFilterExcludeDeleted: string;
  deletedMoviesFilterIncludeDeleted: string;
  deletedMoviesFilterOnlyDeleted: string;
  moviesFilterLabel: string;
  favoriteMoviesFilterLabel: string;
  watchagainMoviesFilterLabel: string;

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
  filterForFavorites: boolean;
  setFilterForFavorites: () => void;
  filterForWatchAgain: boolean;
  setFilterForWatchAgain: () => void
  handleSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  langResources: SearchFormLangResources;
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
  filterForFavorites,
  setFilterForFavorites,
  filterForWatchAgain,
  setFilterForWatchAgain,
  handleSearchSubmit,
  langResources
}) => {
  return (
    <form onSubmit={handleSearchSubmit}>
      <div className="flex w-full flex-wrap md:flex-nowrap pb-4">
        <Input
          isClearable
          errorMessage="Search must have at least 3 characters"
          isInvalid={invalidSearch}
          label={`${langResources.searchLabel} (${langResources.resultCountLabel}: ${totalMoviesCount})`}
          placeholder={langResources.placeholderLabel}
          type="text"
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
      </div>
      <div>
        <div className="w-full flex-wrap md:flex-nowrap pb-4">
          <Accordion variant="bordered" defaultExpandedKeys={["1"]}>
            <AccordionItem
              key="1"
              aria-label={langResources.moviesFilterLabel}
              title={langResources.moviesFilterLabel}>
              <div className="flex w-full flex-row flex-wrap md:flex-nowrap">
                <div className="pr-4">
                  <Switch
                    isSelected={filterForFavorites}
                    onValueChange={setFilterForFavorites}>{langResources.favoriteMoviesFilterLabel}</Switch>
                </div>
                <Switch
                  isSelected={filterForWatchAgain}
                  onValueChange={setFilterForWatchAgain}>{langResources.watchagainMoviesFilterLabel}</Switch>
              </div>
            </AccordionItem>
            <AccordionItem
              key="2"
              aria-label={langResources.deletedMoviesFilterLabel}
              title={langResources.deletedMoviesFilterLabel}>
              <RadioGroup value={deleteMode} onValueChange={setDeleteMode} orientation="horizontal">
                <Radio value="EXCLUDE_DELETED">{langResources.deletedMoviesFilterExcludeDeleted}</Radio>
                <Radio value="INCLUDE_DELETED">{langResources.deletedMoviesFilterIncludeDeleted}</Radio>
                <Radio value="ONLY_DELETED">{langResources.deletedMoviesFilterOnlyDeleted}</Radio>
              </RadioGroup>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;

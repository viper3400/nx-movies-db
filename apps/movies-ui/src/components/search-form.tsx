import { Input, Radio, RadioGroup } from '@heroui/react';
import React from 'react';


interface SearchFormProps {
  searchText: string;
  setSearchText: (text: string) => void;
  invalidSearch: boolean;
  validateSearch: (text: string) => void;
  clearSearchResult: () => void;
  totalMoviesCount: number;
  deleteMode: string;
  setDeleteMode: (mode: string) => void;
  handleSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
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
  handleSearchSubmit,
}) => {
  return (
    <form onSubmit={handleSearchSubmit}>
      <div className="flex w-full flex-wrap md:flex-nowrap pb-4">
        <Input
          isClearable
          errorMessage="Search must have at least 3 characters"
          isInvalid={invalidSearch}
          label={`Search (result count: ${totalMoviesCount})`}
          placeholder="Enter search text"
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
      <div className="flex w-full flex-wrap md:flex-nowrap pb-4">
        <RadioGroup label="Gelöschte Filme" value={deleteMode} onValueChange={setDeleteMode} orientation="horizontal">
          <Radio value="EXCLUDE_DELETED">Exklusive Gelöschte</Radio>
          <Radio value="INCLUDE_DELETED">Inklusive Gelöschte</Radio>
          <Radio value="ONLY_DELETED">Nur Gelöschte</Radio>
        </RadioGroup>
      </div>
    </form>
  );
};

export default SearchForm;

"use client";

import { useState, FormEvent } from "react";
import { Input } from "@nextui-org/input";

import { Movie, MovieCard } from "./movie-card";

import { getMovies } from "../app/services/actions/getMovies";

// Main component that handles user input and renders Data component
export const MovieComponent: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("imposs");
  const [searchTitle, setSearchTitle] = useState<string>(searchText);
  const [invalidSearch, setInvalidSearch] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Movie[]>();
  const [loading, setLoading] = useState<boolean>(false);

  const search = async () => {
    setLoading(true);
    const result = await getMovies(searchText);

    setLoading(false);
    console.log(result);
    setSearchResult(result);
  };

  const validateSearch = (text: string) => {
    setInvalidSearch(text.length < 3);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    validateSearch(searchText);
    if (!invalidSearch) {
      setSearchTitle(searchText);
      setSearchResult(undefined);
      search();
    }
  };

  return (
    <div>
      <form onSubmit={handleSearchSubmit}>
        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
          <Input
            isClearable
            errorMessage="Search must have at least 3 characters"
            isInvalid={invalidSearch}
            label="Search"
            placeholder="Enter search text"
            type="text"
            value={searchText}
            onChange={(e) => {
              const value = e.target.value;
              setSearchText(value);
              validateSearch(value);
            }}
            onClear={() => setSearchText("")}
          />
        </div>
      </form>
      <div className="space-y-4">
        {loading && <div>Loading ...</div>}
        {searchResult && <MovieCard movies={searchResult} />}
      </div>
    </div>
  );
};

"use client";

import { useState, FormEvent } from "react";
import { Input } from "@nextui-org/input";

import { Movie, MovieCard } from "./movie-card";

import { getMovies } from "../app/services/actions/getMovies";
import { Session } from "next-auth";

interface MovieComponentProperties {
  session: Session
}

// Main component that handles user input and renders Data component
export const MovieComponent = ({ session }: MovieComponentProperties) => {
  const [searchText, setSearchText] = useState<string>("");
  const [searchTitle, setSearchTitle] = useState<string>(searchText);
  const [invalidSearch, setInvalidSearch] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Movie[]>();
  const [loading, setLoading] = useState<boolean>(false);

  const invalidTextLength = (text: string) => text.length < 3

  const search = async () => {
    setLoading(true);
    const result = await getMovies(searchText);

    setLoading(false);
    console.log(result);
    setSearchResult(result);
  };

  const validateSearch = (text: string) => {
    setInvalidSearch(invalidTextLength(text));
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    validateSearch(searchText);
    if (!invalidTextLength(searchText)) {
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
              if(invalidSearch) validateSearch(value);
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

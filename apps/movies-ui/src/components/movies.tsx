"use client";

import { useEffect, useState, FormEvent } from "react";
import { Input } from "@nextui-org/input";

import { Movie, MovieCardDeck } from "./movie-card-deck";

import { getMovies, getSeenDates } from "../app/services/actions";
import { Session } from "next-auth";

interface MovieComponentProperties {
  session: Session
}

export interface SeenDateDTO {
  movieId: string;
  dates: string[];
}
// Main component that handles user input and renders Data componen

export const MovieComponent = ({ session }: MovieComponentProperties) => {
  const [searchText, setSearchText] = useState<string>("");
  const [searchTitle, setSearchTitle] = useState<string>(searchText);
  const [invalidSearch, setInvalidSearch] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Movie[]>();
  const [seenDates, setSeenDates] = useState<SeenDateDTO[]>();
  const [loading, setLoading] = useState<boolean>(false);

  const invalidTextLength = (text: string) => text.length < 3;

  const search = async () => {
    setLoading(true);
    const result = await getMovies(searchText);

    setLoading(false);
    setSearchResult(result); // Triggers `useEffect`
  };

  useEffect(() => {
    if (searchResult) {
      const fetchSeenDates = async () => {
        const seenDateCollection: SeenDateDTO[] = [];
        for (const movie of searchResult) {
          const dates = await getSeenDates(movie.id, "VG_Default");
          seenDateCollection.push({ movieId: movie.id, dates });
        }
        setSeenDates(seenDateCollection);
      };

      fetchSeenDates();
    }
  }, [searchResult]); // Run when `searchResult` changes

  const validateSearch = (text: string) => {
    setInvalidSearch(invalidTextLength(text));
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    validateSearch(searchText);
    if (!invalidTextLength(searchText)) {
      setSearchTitle(searchText);
      setSearchResult(undefined);
      setSeenDates([]);
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
              if (invalidSearch) validateSearch(value);
            }}
            onClear={() => setSearchText("")}
          />
        </div>
      </form>
      <div className="space-y-4">
        {loading && <div>Loading ...</div>}
        {searchResult && (
          <MovieCardDeck
            movies={searchResult}
            seenDates={seenDates ? seenDates : []}
          />
        )}
      </div>
    </div>
  );
};

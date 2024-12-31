"use client";

import { useEffect, useState, FormEvent } from "react";
import { Input } from "@nextui-org/input";

import { Movie, MovieCardDeck } from "./movie-card-deck";

import { getMovies, getSeenDates } from "../app/services/actions";
import { Session } from "next-auth";
import { getAppBasePath } from "../app/services/actions/getAppBasePath";
import { RadioGroup, Radio } from "@nextui-org/react";

interface MovieComponentProperties {
  session: Session
}

export interface SeenDateDTO {
  movieId: string;
  dates: string[];
}

// Main component that handles user input and renders Data component

export const MovieComponent = ({ session }: MovieComponentProperties) => {
  const [searchText, setSearchText] = useState<string>("");
  const [searchTitle, setSearchTitle] = useState<string>(searchText);
  const [invalidSearch, setInvalidSearch] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Movie[]>();
  const [seenDates, setSeenDates] = useState<SeenDateDTO[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [imageBaseUrl, setImageBaseUrl] = useState<string>();
  const [deleteMode, setDeleteMode] = useState<string>("EXCLUDE_DELETED");

  const invalidTextLength = (text: string) => text.length < 3;

  const search = async () => {
    setLoading(true);
    const result = await getMovies(searchText, deleteMode);

    setLoading(false);
    setSearchResult(result); // Triggers `useEffect`
  };


  useEffect(() => {
    const fetchAppBasePath = async () => {
    const appBasePath = await getAppBasePath();
    setImageBaseUrl(appBasePath + "/api/cover-image");
    };
    fetchAppBasePath();
  });

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

  useEffect(() => {
    invalidSearch ?? setSearchResult(undefined);
  }, [invalidSearch]);


  // New useEffect to retrigger search when deleteMode changes
  useEffect(() => {
    if (searchResult) {
      invalidTextLength(searchText) ? validateSearch(searchText) : search();
    }
  }, [deleteMode]); // Run when `deleteMode` changes

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
        <div className="flex w-full flex-wrap md:flex-nowrap pb-4">
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
        <div className="flex w-full flex-wrap md:flex-nowrap pb-4">
        <RadioGroup label="Gelöschte Filme" value={deleteMode} onValueChange={setDeleteMode} orientation="horizontal">
          <Radio value="EXCLUDE_DELETED">Exklusive Gelöschte</Radio>
          <Radio value="INCLUDE_DELETED">Inklusive Gelöschte</Radio>
          <Radio value="ONLY_DELETED">Nur Gelöschte</Radio>
        </RadioGroup>
        </div>
      </form>
      <div className="space-y-4">
        {loading && <div>Loading ...</div>}
        {searchResult && imageBaseUrl && (
          <MovieCardDeck
            movies={searchResult}
            seenDates={seenDates ? seenDates : []}
            imageBaseUrl={imageBaseUrl}
          />
        )}
      </div>
    </div>
  );
};

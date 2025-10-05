import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchForm } from "./search-form";
import { CheckboxValue, MovieSearchFilters } from "..";

const meta: Meta<typeof SearchForm> = {
  component: SearchForm,
  title: "SearchForm",
};
export default meta;
type Story = StoryObj<typeof SearchForm>;

export const Default: Story = {
  args: {
    searchText: "",
    invalidSearch: false,
    totalMoviesCount: 42,
    filters: {
      filterForFavorites: true,
      filterForWatchAgain: false,
      filterForMediaTypes: [],
      filterForGenres: [],
      tvSeriesMode: "INCLUDE_TVSERIES",
      deleteMode: "EXCLUDE_DELETED",
      randomExcludeDeleted: true,
    } as MovieSearchFilters,
    isDefaultFilter: false,
    langResources: {
      placeholderLabel: "Search for a movie...",
      searchLabel: "Search",
      resultCountLabel: "Results",
    },
    mediaTypes: [
      { value: "movie", label: "Movie" },
      { value: "tv", label: "TV Series" },
    ] as CheckboxValue[],
    genres: [
      { value: "action", label: "Action" },
      { value: "comedy", label: "Comedy" },
      { value: "drama", label: "Drama" },
    ] as CheckboxValue[],
  },
  render: (args) => {
    function SearchFormWrapper(props: typeof args) {
      const [searchText, setSearchText] = useState(props.searchText);

      const [filters, setFilters] = useState(props.filters);

      return (
        <SearchForm
          {...props}
          searchText={searchText}
          setSearchText={setSearchText}
          filters={filters}
          setFilters={setFilters}
          validateSearch={() => { return true; }}
          clearSearchResult={() => setSearchText("")}
          handleSearchSubmit={(e) => e.preventDefault()}
        />
      );
    }
    return <SearchFormWrapper {...args} />;
  },
};

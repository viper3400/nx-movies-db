import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MovieSearchInput } from "./movie-search-input";

const meta: Meta<typeof MovieSearchInput> = {
  component: MovieSearchInput,
  title: "MovieSearchInput",
};
export default meta;
type Story = StoryObj<typeof MovieSearchInput>;

export const Default: Story = {
  args: {
    searchText: "",
    invalidSearch: false,
    totalMoviesCount: 42,
    langResources: {
      placeholderLabel: "Search for a movie...",
      searchLabel: "Search",
      resultCountLabel: "Results",
    },
  },
  render: (args) => {
    function MovieSearchInputWrapper(props: typeof args) {
      const [searchText, setSearchText] = useState(props.searchText);

      return (
        <MovieSearchInput
          {...props}
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onClearSearch={() => setSearchText("")}
        />
      );
    }

    return <MovieSearchInputWrapper {...args} />;
  },
};

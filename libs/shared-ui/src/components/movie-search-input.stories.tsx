import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
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
      suggestionsLoadingLabel: "Searching…",
      suggestionsEmptyLabel: "No matching movies",
      suggestionMetadataLabel: "·",
      enableAutocompleteLabel: "Enable autocomplete",
      disableAutocompleteLabel: "Disable autocomplete",
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

const suggestions = [
  { id: "1", title: "Matrix", subtitle: "The Wachowskis", diskid: "R01F1" },
  { id: "2", title: "Matrix Reloaded", subtitle: null, diskid: "R01F2" },
  { id: "3", title: "Matrix Revolutions", subtitle: null, diskid: "R01F3" },
];

export const LoadingSuggestions: Story = {
  args: {
    ...Default.args,
    searchText: "ma",
    suggestionsLoading: true,
    onSuggestionSelect: fn(),
  },
  render: Default.render,
};

export const MatchingSuggestions: Story = {
  args: {
    ...Default.args,
    searchText: "ma",
    suggestions,
    onSuggestionSelect: fn(),
  },
  render: Default.render,
};

export const NoMatchingSuggestions: Story = {
  args: {
    ...Default.args,
    searchText: "zz",
    suggestions: [],
    onSuggestionSelect: fn(),
  },
  render: Default.render,
};

export const HoverFeedback: Story = {
  args: {
    ...MatchingSuggestions.args,
  },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId("MovieSearchField");
    await userEvent.click(input);

    const listbox = canvas.getByTestId("movie-search-suggestions");
    const firstOption = within(listbox).getAllByRole("option")[0];
    const backgroundBeforeHover = window.getComputedStyle(firstOption).backgroundColor;

    await userEvent.hover(firstOption);

    expect(window.getComputedStyle(firstOption).backgroundColor).not.toBe(backgroundBeforeHover);
  },
};

export const KeyboardNavigation: Story = {
  args: {
    ...MatchingSuggestions.args,
  },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId("MovieSearchField");

    await userEvent.click(input);
    const listbox = canvas.getByTestId("movie-search-suggestions");
    const firstOption = within(listbox).getAllByRole("option")[0];
    const backgroundBeforeSelection = window.getComputedStyle(firstOption).backgroundColor;
    await userEvent.keyboard("{ArrowDown}");

    expect(firstOption).toHaveAttribute("aria-selected", "true");
    expect(window.getComputedStyle(firstOption).backgroundColor).not.toBe(backgroundBeforeSelection);
  },
};

export const AutocompleteToggleTooltip: Story = {
  args: {
    ...MatchingSuggestions.args,
    autocompleteEnabled: true,
    onAutocompleteEnabledChange: fn(),
  },
  render: Default.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByTestId("movie-search-autocomplete-toggle");

    expect(toggle).toHaveAccessibleName("Disable autocomplete");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  },
};

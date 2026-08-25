/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { createEvent, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";

import { MovieSearchInput } from "./movie-search-input";

jest.mock("@heroui/react", () => {
  const InputGroup = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;
  InputGroup.Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />;
  InputGroup.Suffix = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Tooltip = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Tooltip.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    Button: ({ children, onPress, isIconOnly: _isIconOnly, size: _size, variant: _variant, ...props }: {
      children: React.ReactNode;
      onPress?: () => void;
      isIconOnly?: boolean;
      size?: string;
      variant?: string;
    }) => (
      <button type="button" onClick={onPress} {...props}>{children}</button>
    ),
    CloseButton: ({ onPress, ...props }: { onPress?: () => void }) => <button type="button" onClick={onPress} {...props} />,
    FieldError: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    InputGroup,
    Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
    TextField: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Tooltip,
  };
});

const langResources = {
  placeholderLabel: "Search",
  searchLabel: "Search",
  resultCountLabel: "Results",
  suggestionsLoadingLabel: "Searching collection…",
  suggestionsEmptyLabel: "No matching movies",
  suggestionMetadataLabel: "·",
  enableAutocompleteLabel: "Enable autocomplete",
  disableAutocompleteLabel: "Disable autocomplete",
};

describe("MovieSearchInput autocomplete", () => {
  it("supports keyboard selection with accessible options", () => {
    const onSuggestionSelect = jest.fn();
    render(<MovieSearchInput
      searchText="ma"
      onSearchTextChange={jest.fn()}
      invalidSearch={false}
      onClearSearch={jest.fn()}
      totalMoviesCount={0}
      langResources={langResources}
      onSuggestionSelect={onSuggestionSelect}
      onKeyDown={(event) => event.preventDefault()}
      suggestions={[
        { id: "1", title: "Matrix", subtitle: null, diskid: "R01F1" },
        { id: "2", title: "Maverick", subtitle: "Top Gun", diskid: null },
      ]}
    />);

    const input = screen.getByTestId("MovieSearchField");
    expect(input).toHaveAttribute("autocomplete", "off");
    fireEvent.focus(input);
    const listbox = screen.getByTestId("movie-search-suggestions");
    expect(within(listbox).getAllByRole("option")).toHaveLength(2);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(within(listbox).getByRole("option", { name: /matrix/i })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSuggestionSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
  });

  it("shows an empty result message and dismisses it with Escape", () => {
    render(<MovieSearchInput
      searchText="zz"
      onSearchTextChange={jest.fn()}
      invalidSearch={false}
      onClearSearch={jest.fn()}
      totalMoviesCount={0}
      langResources={langResources}
      onSuggestionSelect={jest.fn()}
      suggestions={[]}
    />);

    const input = screen.getByTestId("MovieSearchField");
    fireEvent.focus(input);
    expect(screen.getByTestId("movie-search-suggestions-empty")).toHaveTextContent("No matching movies");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByTestId("movie-search-suggestions")).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByTestId("movie-search-suggestions")).toBeInTheDocument();
  });

  it("dismisses suggestions on Enter without preventing the enclosing form submission", () => {
    render(<MovieSearchInput
      searchText="ma"
      onSearchTextChange={jest.fn()}
      invalidSearch={false}
      onClearSearch={jest.fn()}
      totalMoviesCount={0}
      langResources={langResources}
      onSuggestionSelect={jest.fn()}
      suggestions={[{ id: "1", title: "Matrix", subtitle: null, diskid: "R01F1" }]}
    />);

    const input = screen.getByTestId("MovieSearchField");
    fireEvent.focus(input);
    expect(screen.getByTestId("movie-search-suggestions")).toBeInTheDocument();

    const enter = createEvent.keyDown(input, { key: "Enter" });
    fireEvent(input, enter);

    expect(enter.defaultPrevented).toBe(false);
    expect(screen.queryByTestId("movie-search-suggestions")).not.toBeInTheDocument();
  });

  it("reopens suggestions when the user continues typing after a selection", async () => {
    const SearchHarness = () => {
      const [searchText, setSearchText] = React.useState("ma");
      return <MovieSearchInput
        searchText={searchText}
        onSearchTextChange={setSearchText}
        invalidSearch={false}
        onClearSearch={jest.fn()}
        totalMoviesCount={0}
        langResources={langResources}
        onSuggestionSelect={(suggestion) => setSearchText(suggestion.title ?? "")}
        suggestions={[{ id: "1", title: "Matrix", subtitle: null, diskid: "R01F1" }]}
      />;
    };

    render(<SearchHarness />);
    const input = screen.getByTestId("MovieSearchField");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(screen.queryByTestId("movie-search-suggestions")).not.toBeInTheDocument());
    fireEvent.change(input, { target: { value: "Matrix R" } });

    await waitFor(() => expect(screen.getByTestId("movie-search-suggestions")).toBeInTheDocument());
  });

  it("places an autocomplete toggle before the clear button", () => {
    const onAutocompleteEnabledChange = jest.fn();
    render(<MovieSearchInput
      searchText="ma"
      onSearchTextChange={jest.fn()}
      invalidSearch={false}
      onClearSearch={jest.fn()}
      totalMoviesCount={0}
      langResources={langResources}
      autocompleteEnabled
      onAutocompleteEnabledChange={onAutocompleteEnabledChange}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Disable autocomplete" }));
    expect(onAutocompleteEnabledChange).toHaveBeenCalledWith(false);
    expect(screen.getByText("Disable autocomplete")).toBeInTheDocument();
  });
});

import { Button, CloseButton, FieldError, InputGroup, Label, TextField, Tooltip } from "@heroui/react";
import React, { useEffect, useRef, useState } from "react";
import { ManageSearchIcon } from "../icons";

export interface MovieSearchInputLangResources {
  placeholderLabel: string;
  searchLabel: string;
  resultCountLabel: string;
  suggestionsLoadingLabel: string;
  suggestionsEmptyLabel: string;
  suggestionMetadataLabel: string;
  enableAutocompleteLabel: string;
  disableAutocompleteLabel: string;
}

export interface MovieSearchSuggestion {
  id: string;
  title: string | null;
  subtitle: string | null;
  diskid: string | null;
}

export interface MovieSearchInputProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  invalidSearch: boolean;
  onClearSearch: () => void;
  totalMoviesCount: number;
  langResources: MovieSearchInputLangResources;
  dataTestId?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  suggestions?: MovieSearchSuggestion[];
  suggestionsLoading?: boolean;
  onSuggestionSelect?: (suggestion: MovieSearchSuggestion) => void;
  autocompleteEnabled?: boolean;
  onAutocompleteEnabledChange?: (enabled: boolean) => void;
}

export const MovieSearchInput: React.FC<MovieSearchInputProps> = ({
  searchText,
  onSearchTextChange,
  invalidSearch,
  onClearSearch,
  totalMoviesCount,
  langResources,
  dataTestId,
  onKeyDown,
  suggestions,
  suggestionsLoading = false,
  onSuggestionSelect,
  autocompleteEnabled = true,
  onAutocompleteEnabledChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSuggestionsDismissed, setIsSuggestionsDismissed] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [hoveredSuggestionIndex, setHoveredSuggestionIndex] = useState<number | null>(null);
  const skipNextQueryResetRef = useRef(false);
  const queryIsLongEnough = searchText.trim().length >= 2;
  const isOpen = autocompleteEnabled && isFocused && !isSuggestionsDismissed && queryIsLongEnough && Boolean(onSuggestionSelect);
  const suggestionCount = suggestions?.length ?? 0;

  useEffect(() => {
    setActiveSuggestionIndex(-1);
    setHoveredSuggestionIndex(null);
    if (skipNextQueryResetRef.current) {
      skipNextQueryResetRef.current = false;
    } else {
      setIsSuggestionsDismissed(false);
    }
  }, [searchText]);

  const selectSuggestion = (suggestion: MovieSearchSuggestion) => {
    // Selecting with the mouse retains DOM focus on the input. Keep the
    // component state aligned, but keep this result list closed until the
    // user changes the query again.
    skipNextQueryResetRef.current = true;
    setIsSuggestionsDismissed(true);
    setActiveSuggestionIndex(-1);
    onSuggestionSelect?.(suggestion);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    onKeyDown?.(event);
    if (event.key === "Escape") {
      event.preventDefault();
      setIsSuggestionsDismissed(true);
      setActiveSuggestionIndex(-1);
      return;
    }

    if (isSuggestionsDismissed && isFocused && queryIsLongEnough && event.key === "ArrowDown") {
      event.preventDefault();
      setIsSuggestionsDismissed(false);
      setActiveSuggestionIndex(0);
      return;
    }

    if (!isOpen) return;

    if (event.key === "ArrowDown" && suggestionCount > 0) {
      event.preventDefault();
      setActiveSuggestionIndex((current) => (current + 1) % suggestionCount);
    } else if (event.key === "ArrowUp" && suggestionCount > 0) {
      event.preventDefault();
      setActiveSuggestionIndex((current) => (current <= 0 ? suggestionCount - 1 : current - 1));
    } else if (event.key === "Enter") {
      if (activeSuggestionIndex >= 0 && suggestions?.[activeSuggestionIndex]) {
        event.preventDefault();
        selectSuggestion(suggestions[activeSuggestionIndex]);
      } else {
        // Do not prevent the event: the enclosing search form must still submit.
        setIsSuggestionsDismissed(true);
      }
    }
  };

  return (
    <TextField className="relative w-full" isInvalid={invalidSearch} name="movie-search" type="text">
      <Label>{`${langResources.searchLabel} (${langResources.resultCountLabel}: ${totalMoviesCount})`}</Label>
      <InputGroup
        className="inline-flex w-full min-h-12 items-center"
        variant="secondary"
        onKeyDownCapture={handleKeyDown}
        style={isOpen ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : undefined}
      >
        <InputGroup.Input
          className="px-3 py-3 text-base"
          data-testid={dataTestId ?? "MovieSearchField"}
          placeholder={langResources.placeholderLabel}
          value={searchText}
          autoComplete="off"
          onChange={(event) => onSearchTextChange(event.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setIsSuggestionsDismissed(false);
          }}
          onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}
          aria-autocomplete="list"
          aria-controls="movie-search-suggestions"
          aria-expanded={isOpen}
          aria-activedescendant={activeSuggestionIndex >= 0 ? `movie-search-suggestion-${activeSuggestionIndex}` : undefined}
        />
        {(searchText || onAutocompleteEnabledChange) ? (
          <InputGroup.Suffix className="px-3">
            {onAutocompleteEnabledChange && (
              <Tooltip delay={0}>
                <Button
                  aria-label={autocompleteEnabled ? langResources.disableAutocompleteLabel : langResources.enableAutocompleteLabel}
                  aria-pressed={autocompleteEnabled}
                  className="relative mr-2 min-w-0 p-1"
                  data-testid="movie-search-autocomplete-toggle"
                  isIconOnly
                  size="sm"
                  variant="tertiary"
                  onPress={() => onAutocompleteEnabledChange(!autocompleteEnabled)}
                >
                  <ManageSearchIcon size={24} className="!size-6" />
                  {!autocompleteEnabled && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-0.5 w-full -rotate-45 bg-current"
                    />
                  )}
                </Button>
                <Tooltip.Content placement="top" className="z-[60]">
                  {autocompleteEnabled ? langResources.disableAutocompleteLabel : langResources.enableAutocompleteLabel}
                </Tooltip.Content>
              </Tooltip>
            )}
            {searchText && <CloseButton aria-label="Clear search" onPress={onClearSearch} />}
          </InputGroup.Suffix>
        ) : null}
      </InputGroup>
      {isOpen && (
        <div
          id="movie-search-suggestions"
          role="listbox"
          aria-label={langResources.searchLabel}
          className="absolute z-50 mt-0 overflow-hidden shadow-large"
          style={{
            backgroundColor: "var(--surface-secondary)",
            // The input focus outline sits outside its layout box. Extend
            // the popup by the same amount so their outer frames align.
            top: "calc(100% - 4px)",
            left: "-2px",
            width: "calc(100% + 4px)",
            border: "2px solid var(--accent)",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: "1.5rem",
            borderBottomRightRadius: "1.5rem",
            boxShadow: "0 12px 24px rgb(0 0 0 / 45%)",
          }}
          data-testid="movie-search-suggestions"
        >
          {suggestionsLoading && (
            <div className="px-3 py-2 text-sm text-default-500" data-testid="movie-search-suggestions-loading">
              {langResources.suggestionsLoadingLabel}
            </div>
          )}
          {!suggestionsLoading && suggestions?.length === 0 && (
            <div className="px-3 py-2 text-sm text-default-500" data-testid="movie-search-suggestions-empty">
              {langResources.suggestionsEmptyLabel}
            </div>
          )}
          {!suggestionsLoading && suggestions?.map((suggestion, index) => {
            const isHighlighted = activeSuggestionIndex === index || hoveredSuggestionIndex === index;
            return (
              <button
                key={suggestion.id}
                id={`movie-search-suggestion-${index}`}
                type="button"
                role="option"
                aria-selected={activeSuggestionIndex === index}
                className="flex w-full flex-col px-3 py-2 text-left transition-colors"
                style={isHighlighted ? {
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-foreground)",
                } : undefined}
                onMouseEnter={() => setHoveredSuggestionIndex(index)}
                onMouseLeave={() => setHoveredSuggestionIndex(null)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
              >
                <span className="font-medium">{suggestion.title || suggestion.subtitle || suggestion.diskid}</span>
                {(suggestion.subtitle || suggestion.diskid) && (
                  <span className="text-sm opacity-70">
                    {[suggestion.subtitle, suggestion.diskid].filter(Boolean).join(` ${langResources.suggestionMetadataLabel} `)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <FieldError>{invalidSearch ? "Search must have at least 3 characters" : undefined}</FieldError>
    </TextField>
  );
};

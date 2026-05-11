/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { VideoData } from "@nx-movies-db/shared-types";
import { normalizeVideoDataForForm, UpsertVideoForm } from "./upsert-video-form";
import { searchTmdbMovies, upsertVideoData } from "../app/services/actions";
import { useAvailableMediaAndGenres } from "../hooks/useAvailableMediaAndGenres";
import { useAvailableOwners } from "../hooks/useAvailableOwners";

type UpsertVideoDataFormProps = {
  values: VideoData;
  onChange: (values: VideoData) => void;
  readOnly?: boolean;
  readOnlyFields?: Partial<Record<keyof VideoData, boolean>>;
};

const mockUpsertVideoDataForm = jest.fn((props: UpsertVideoDataFormProps) => {
  const fieldDisabled = (key: keyof VideoData) => props.readOnly || !!props.readOnlyFields?.[key];
  const updateTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange({ ...props.values, title: event.target.value });
  };

  return (
    <div>
      {([
        "id",
        "md5",
        "filesize",
        "filedate",
        "audio_codec",
        "video_codec",
        "video_width",
        "video_height",
        "lastupdate",
        "created",
        "title",
        "diskid",
        "year",
        "owner_id",
      ] as Array<keyof VideoData>).map((key) => (
        <input
          key={key}
          data-testid={`mock-field-${String(key)}`}
          disabled={fieldDisabled(key)}
          value={key === "title" ? props.values.title ?? "" : props.values[key]?.toString() ?? ""}
          onChange={key === "title" ? updateTitle : undefined}
          readOnly={key !== "title"}
        />
      ))}
    </div>
  );
});

const mockReplace = jest.fn();

let mockMediaAndGenresState = {
  availableMediaTypes: [{ label: "DVD", value: "1" }],
  availableGenres: [],
  loadingMediaTypes: false,
  loadingGenres: false,
  mediaTypesError: null as Error | null,
  genresError: null as Error | null,
};

let mockOwnersState = {
  availableOwners: [{ label: "Session Owner", value: "7" }],
  loadingOwners: false,
  ownersError: null as Error | null,
};

jest.mock("@heroui/react", () => ({
  Button: ({
    children,
    isDisabled,
    isLoading,
    onPress,
    ...props
  }: {
    children: React.ReactNode;
    isDisabled?: boolean;
    isLoading?: boolean;
    onPress?: () => void;
  }) => (
    <button type="button" disabled={isDisabled || isLoading} onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  CardBody: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  Chip: ({ children, ...props }: { children: React.ReactNode }) => <span {...props}>{children}</span>,
  Tooltip: ({
    children,
    content,
    isDisabled,
  }: {
    children: React.ReactNode;
    content?: React.ReactNode;
    isDisabled?: boolean;
  }) => (
    <div>
      {children}
      {!isDisabled && content ? <div data-testid="mock-tooltip-content">{content}</div> : null}
    </div>
  ),
  Skeleton: (props: Record<string, unknown>) => <div data-testid="mock-skeleton" {...props} />,
  Spacer: (props: Record<string, unknown>) => <div data-testid="mock-spacer" {...props} />,
  Switch: ({
    children,
    isSelected,
    onValueChange,
    ...props
  }: {
    children: React.ReactNode;
    isSelected?: boolean;
    onValueChange?: (selected: boolean) => void;
  }) => (
    <label>
      <input
        type="checkbox"
        checked={!!isSelected}
        onChange={(event) => onValueChange?.(event.target.checked)}
        {...props}
      />
      {children}
    </label>
  ),
  addToast: jest.fn(),
}));

jest.mock("@nx-movies-db/shared-ui", () => {
  const actual = jest.requireActual("../../../../libs/shared-ui/src/components/editable-form-wrapper");
  return {
    EditableFormWrapper: actual.EditableFormWrapper,
    TmdbMetadataSearchPanel: ({
      query,
      results,
      queryTestId = "tmdb-search-query",
      submitTestId = "tmdb-search-submit",
      onQueryChange,
      onSearch,
      onSelect,
    }: {
      query: string;
      results: Array<{ id: number; title: string }>;
      queryTestId?: string;
      submitTestId?: string;
      onQueryChange: (query: string) => void;
      onSearch: () => void;
      onSelect?: (result: any) => void;
    }) => (
      <div data-testid="mock-tmdb-search-panel">
        <input
          data-testid={queryTestId}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <button data-testid={submitTestId} type="button" onClick={onSearch}>
          Search
        </button>
        {results.map((result) => (
          <button
            key={result.id}
            data-testid={`mock-tmdb-result-${result.id}`}
            type="button"
            onClick={() => onSelect?.(result)}
          >
            {result.title}
          </button>
        ))}
      </div>
    ),
    TmdbMetadataMergePanel: ({
      candidates,
      backdropCandidates = [],
      selectedBackdropUrl,
      genreMatches = [],
      availableGenres = [],
      genrePickerTmdbGenre,
      onCandidateSelectionChange,
      onBackdropSelectionChange,
      onUnmappedGenrePress,
      onManualGenreSelection,
      onApplySelected,
      onNoMatch,
    }: {
      candidates: Array<{ field: string; label: string; selected: boolean }>;
      backdropCandidates?: Array<{ url: string }>;
      selectedBackdropUrl?: string | null;
      genreMatches?: Array<{ tmdbGenre: string; localGenre?: string }>;
      availableGenres?: Array<{ label: string; value: string }>;
      genrePickerTmdbGenre?: string | null;
      onCandidateSelectionChange: (field: string, selected: boolean) => void;
      onBackdropSelectionChange?: (url: string) => void;
      onUnmappedGenrePress?: (tmdbGenre: string) => void;
      onManualGenreSelection?: (selection: Set<string>) => void;
      onApplySelected: () => void;
      onNoMatch: () => void;
    }) => (
      <div data-testid="mock-tmdb-merge-panel">
        {backdropCandidates.length > 1 && (
          <div data-testid="mock-tmdb-backdrop-picker">
            {backdropCandidates.map((candidate, index) => (
              <button
                key={candidate.url}
                data-testid={`mock-tmdb-backdrop-option-${index}`}
                data-selected={candidate.url === selectedBackdropUrl}
                type="button"
                onClick={() => onBackdropSelectionChange?.(candidate.url)}
              >
                {candidate.url}
              </button>
            ))}
          </div>
        )}
        {candidates.map((candidate) => (
          <label key={candidate.field}>
            {candidate.label}
            <input
              data-testid={`mock-tmdb-merge-select-${candidate.field}`}
              type="checkbox"
              checked={candidate.selected}
              onChange={(event) => onCandidateSelectionChange(candidate.field, event.target.checked)}
            />
          </label>
        ))}
        {genreMatches.map((match) => (
          <button
            key={match.tmdbGenre}
            data-testid={`mock-tmdb-merge-genre-${match.tmdbGenre}`}
            type="button"
            onClick={() => onUnmappedGenrePress?.(match.tmdbGenre)}
          >
            {match.localGenre ? `${match.tmdbGenre} -> ${match.localGenre}` : match.tmdbGenre}
          </button>
        ))}
        {genrePickerTmdbGenre && (
          <select
            data-testid="mock-tmdb-merge-manual-genre-select"
            onChange={(event) => onManualGenreSelection?.(new Set([event.target.value]))}
          >
            <option value="">Select</option>
            {availableGenres.map((genre) => (
              <option key={genre.value} value={genre.value}>
                {genre.label}
              </option>
            ))}
          </select>
        )}
        <button data-testid="mock-tmdb-merge-apply" type="button" onClick={onApplySelected}>
          Apply selected
        </button>
        <button data-testid="mock-tmdb-merge-no-match" type="button" onClick={onNoMatch}>
          No TMDB match
        </button>
      </div>
    ),
    UpsertVideoDataForm: (props: UpsertVideoDataFormProps) => mockUpsertVideoDataForm(props),
  };
});

jest.mock("../app/services/actions", () => ({
  ...jest.requireActual("../app/services/actions/tmdbMetadataMapper"),
  getNextDiskIdSuggestion: jest.fn(() => Promise.resolve({ nextDiskIdSuggestion: null })),
  searchTmdbMovies: jest.fn(),
  upsertVideoData: jest.fn(),
}));

jest.mock("../hooks/useAvailableMediaAndGenres", () => ({
  useAvailableMediaAndGenres: jest.fn(() => mockMediaAndGenresState),
}));

jest.mock("../hooks/useAvailableOwners", () => ({
  useAvailableOwners: jest.fn(() => mockOwnersState),
}));

jest.mock("../hooks/useAppBasePath", () => ({
  useAppBasePath: () => ({ appBasePath: "" }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockUpsertVideoData = jest.mocked(upsertVideoData);
const mockSearchTmdbMovies = jest.mocked(searchTmdbMovies);
const mockUseAvailableMediaAndGenres = jest.mocked(useAvailableMediaAndGenres);
const mockUseAvailableOwners = jest.mocked(useAvailableOwners);

const baseVideoData: VideoData = {
  id: null,
  md5: "",
  title: "Existing",
  subtitle: "",
  language: "en",
  diskid: "",
  comment: "",
  disklabel: "",
  imdbID: "",
  year: 2026,
  imgurl: "",
  director: "",
  actors: "",
  runtime: null,
  country: "",
  plot: "",
  rating: "",
  filename: "",
  filesize: null,
  filedate: null,
  audio_codec: "",
  video_codec: "",
  video_width: null,
  video_height: null,
  istv: 0,
  lastupdate: null,
  mediatype: 1,
  custom1: "",
  custom2: "",
  custom3: "",
  custom4: "",
  created: null,
  owner_id: 1,
  genreIds: [],
};

function changeTitleAndSave(title: string) {
  fireEvent.change(screen.getByTestId("mock-field-title"), {
    target: { value: title },
  });
  fireEvent.click(screen.getByTestId("editable-form-save"));
}

describe("UpsertVideoForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockMediaAndGenresState = {
      availableMediaTypes: [{ label: "DVD", value: "1" }],
      availableGenres: [],
      loadingMediaTypes: false,
      loadingGenres: false,
      mediaTypesError: null,
      genresError: null,
    };
    mockOwnersState = {
      availableOwners: [{ label: "Session Owner", value: "7" }],
      loadingOwners: false,
      ownersError: null,
    };
    mockUpsertVideoData.mockResolvedValue({ id: 99, title: "Saved" } as VideoData);
    mockSearchTmdbMovies.mockResolvedValue([]);
    global.fetch = jest.fn();
  });

  it("uses the provided default owner id when saving a new blank entry", async () => {
    render(<UpsertVideoForm defaultOwnerId={7} />);

    changeTitleAndSave("New Title");

    await waitFor(() => {
      expect(mockUpsertVideoData).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Title",
          owner_id: 7,
        })
      );
    });
  });

  it("preserves owner id from existing initial values", async () => {
    render(<UpsertVideoForm defaultOwnerId={7} initialValues={{ ...baseVideoData, owner_id: 3 }} />);

    changeTitleAndSave("Existing Changed");

    await waitFor(() => {
      expect(mockUpsertVideoData).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Existing Changed",
          owner_id: 3,
        })
      );
    });
  });

  it("shows changed field labels in the dirty indicator tooltip", () => {
    render(<UpsertVideoForm defaultOwnerId={7} initialValues={{ ...baseVideoData, title: "Original" }} />);

    fireEvent.change(screen.getByTestId("mock-field-title"), {
      target: { value: "Changed" },
    });

    expect(screen.getByText("Änderungen vorhanden")).toBeInTheDocument();
    expect(screen.getByTestId("mock-tooltip-content")).toHaveTextContent("Changed: Title");
  });

  it("marks backend-managed fields readonly while keeping user-editable fields enabled", () => {
    render(<UpsertVideoForm defaultOwnerId={7} />);

    [
      "id",
      "md5",
      "filesize",
      "filedate",
      "audio_codec",
      "video_codec",
      "video_width",
      "video_height",
      "lastupdate",
      "created",
    ].forEach((field) => {
      expect(screen.getByTestId(`mock-field-${field}`)).toBeDisabled();
    });

    ["title", "diskid", "year", "owner_id"].forEach((field) => {
      expect(screen.getByTestId(`mock-field-${field}`)).toBeEnabled();
    });
  });

  it("disables owner id only while owner options are loading", () => {
    const { rerender } = render(<UpsertVideoForm defaultOwnerId={7} />);
    expect(screen.getByTestId("mock-field-owner_id")).toBeEnabled();

    mockOwnersState = {
      ...mockOwnersState,
      loadingOwners: true,
    };
    mockUseAvailableOwners.mockImplementation(() => mockOwnersState);
    mockUseAvailableMediaAndGenres.mockImplementation(() => mockMediaAndGenresState);

    rerender(<UpsertVideoForm defaultOwnerId={7} />);

    expect(screen.getByTestId("mock-field-owner_id")).toBeDisabled();
  });

  it("normalizes sparse existing values without marking the form dirty on mount", () => {
    const sparseVideo = normalizeVideoDataForForm({
      ...baseVideoData,
      id: 2131,
      title: "The Kings of Summer",
      subtitle: null,
      language: null,
      comment: null,
      disklabel: null,
      imdbID: "ofdb:234964",
      year: 2013,
      imgurl: "./coverpics/2131.jpg",
      director: null,
      actors: "Actor One::::ofdb:0\r\nActor Two::::ofdb:0",
      runtime: 95,
      country: null,
      plot: null,
      rating: null,
      filename: "\"V:\\\\Filme\\\\Kings of Summer\\\\Kings of Summer.mkv\"",
      filesize: null,
      filedate: null,
      audio_codec: null,
      video_codec: null,
      video_width: null,
      video_height: null,
      istv: 0,
      lastupdate: new Date("2021-10-09T15:30:39.000Z"),
      mediatype: 16,
      custom1: null,
      custom2: "4006680071077",
      custom3: "http://img.ofdb.de/film/234/234964.jpg",
      custom4: null,
      created: new Date("2014-11-22T09:34:09.000Z"),
      owner_id: 3,
      genreIds: [4],
    }, 7);

    render(<UpsertVideoForm defaultOwnerId={7} initialValues={sparseVideo} />);

    expect(screen.getByTestId("editable-form-save")).toBeDisabled();
    expect(screen.getByTestId("editable-form-discard")).toBeDisabled();
    expect(screen.getByText("Alle Änderungen gespeichert")).toBeInTheDocument();

    const lastCall =
      mockUpsertVideoDataForm.mock.calls[mockUpsertVideoDataForm.mock.calls.length - 1]?.[0];
    expect(lastCall.values.language).toBe("");
    expect(lastCall.values.subtitle).toBe("");
    expect(lastCall.values.custom4).toBe("");
    expect(lastCall.values.actors).toBe("Actor One::::ofdb:0\nActor Two::::ofdb:0");
    expect(lastCall.values.owner_id).toBe(3);
    expect(lastCall.values.genreIds).toEqual([4]);
    expect(lastCall.values.created?.toISOString()).toBe("2014-11-22T00:00:00.000Z");
    expect(lastCall.values.lastupdate?.toISOString()).toBe("2021-10-09T00:00:00.000Z");
  });

  it("shows TMDB search by default for new entries and collapsed refresh for existing entries", () => {
    const { rerender } = render(<UpsertVideoForm defaultOwnerId={7} />);

    expect(screen.queryByTestId("tmdb-refresh-toggle")).not.toBeInTheDocument();
    expect(screen.getByTestId("tmdb-refresh-panel")).toBeInTheDocument();

    rerender(<UpsertVideoForm defaultOwnerId={7} initialValues={{ ...baseVideoData, id: 530 }} />);

    expect(screen.getByTestId("tmdb-refresh-toggle")).toBeInTheDocument();
    expect(screen.queryByTestId("tmdb-refresh-panel")).not.toBeInTheDocument();
  });

  it("applies selected TMDB fields to a new draft before saving", async () => {
    mockSearchTmdbMovies.mockResolvedValue([
      {
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A hacker story.",
        releaseDate: "1999-03-31",
        posterUrl: null,
      },
    ]);
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A computer hacker learns about the true nature of reality.",
        releaseDate: "1999-03-31",
        runtime: 136,
        voteAverage: 8.2,
        posterUrl: null,
        backdropUrl: null,
        backdropCandidates: [],
        imdbId: "tt0133093",
        genres: [],
        productionCountries: ["United States of America"],
        directors: ["Lana Wachowski"],
        cast: [],
        language: "de-DE",
      }),
    } as Response);

    render(<UpsertVideoForm defaultOwnerId={7} />);

    fireEvent.change(screen.getByTestId("tmdb-refresh-query"), {
      target: { value: "Matrix" },
    });
    fireEvent.click(screen.getByTestId("tmdb-refresh-search-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-result-603")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-result-603"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-merge-select-title")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-merge-apply"));
    await waitFor(() => {
      expect(screen.getByTestId("editable-form-save")).toBeEnabled();
    });
    fireEvent.click(screen.getByTestId("editable-form-save"));

    await waitFor(() => {
      expect(mockUpsertVideoData).toHaveBeenCalledWith(
        expect.objectContaining({
          id: null,
          title: "Matrix",
          language: "de",
          plot: "A computer hacker learns about the true nature of reality.",
          imdbID: "tmdb:movie:603",
          owner_id: 7,
        })
      );
    });
  });

  it("applies selected TMDB fields to the draft before saving", async () => {
    mockSearchTmdbMovies.mockResolvedValue([
      {
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A hacker story.",
        releaseDate: "1999-03-31",
        posterUrl: null,
      },
    ]);
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A computer hacker learns about the true nature of reality.",
        releaseDate: "1999-03-31",
        runtime: 136,
        voteAverage: 8.2,
        posterUrl: null,
        backdropUrl: null,
        backdropCandidates: [],
        imdbId: "tt0133093",
        genres: ["Action"],
        productionCountries: ["United States of America"],
        directors: ["Lana Wachowski"],
        cast: [],
        language: "de-DE",
      }),
    } as Response);

    render(
      <UpsertVideoForm
        defaultOwnerId={7}
        initialValues={{
          ...baseVideoData,
          id: 530,
          title: "Local Title",
          language: "",
          plot: "",
          imdbID: "",
          diskid: "R01F1D01",
          owner_id: 7,
        }}
      />
    );

    fireEvent.click(screen.getByTestId("tmdb-refresh-toggle"));
    fireEvent.change(screen.getByTestId("tmdb-refresh-query"), {
      target: { value: "Matrix" },
    });
    fireEvent.click(screen.getByTestId("tmdb-refresh-search-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-result-603")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-result-603"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-merge-select-plot")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-merge-apply"));
    fireEvent.click(screen.getByTestId("editable-form-save"));

    await waitFor(() => {
      expect(mockUpsertVideoData).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 530,
          title: "Local Title",
          language: "de",
          plot: "A computer hacker learns about the true nature of reality.",
          imdbID: "tmdb:movie:603",
          diskid: "R01F1D01",
          owner_id: 7,
        })
      );
    });
  });

  it("keeps the draft unchanged when the TMDB result is dismissed as no match", async () => {
    mockSearchTmdbMovies.mockResolvedValue([
      {
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A hacker story.",
        releaseDate: "1999-03-31",
        posterUrl: null,
      },
    ]);
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A computer hacker learns about the true nature of reality.",
        releaseDate: "1999-03-31",
        runtime: 136,
        voteAverage: 8.2,
        posterUrl: null,
        backdropUrl: null,
        backdropCandidates: [],
        imdbId: "tt0133093",
        genres: [],
        productionCountries: [],
        directors: [],
        cast: [],
        language: "de-DE",
      }),
    } as Response);

    render(
      <UpsertVideoForm
        defaultOwnerId={7}
        initialValues={{ ...baseVideoData, id: 530, language: "", plot: "", imdbID: "" }}
      />
    );

    fireEvent.click(screen.getByTestId("tmdb-refresh-toggle"));
    fireEvent.click(screen.getByTestId("tmdb-refresh-search-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-result-603")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-result-603"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-merge-select-title")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-merge-no-match"));
    fireEvent.change(screen.getByTestId("mock-field-title"), {
      target: { value: "Manual Only" },
    });
    fireEvent.click(screen.getByTestId("editable-form-save"));

    await waitFor(() => {
      expect(mockUpsertVideoData).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Manual Only",
          language: "",
          plot: "",
          imdbID: "",
        })
      );
    });
  });

  it("allows TMDB refresh genres to be manually mapped before applying metadata", async () => {
    mockMediaAndGenresState = {
      ...mockMediaAndGenresState,
      availableGenres: [{ label: "Undefined", value: "26" }],
    };
    mockUseAvailableMediaAndGenres.mockImplementation(() => mockMediaAndGenresState);
    mockSearchTmdbMovies.mockResolvedValue([
      {
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A hacker story.",
        releaseDate: "1999-03-31",
        posterUrl: null,
      },
    ]);
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "",
        releaseDate: "1999-03-31",
        runtime: null,
        voteAverage: null,
        posterUrl: null,
        backdropUrl: null,
        backdropCandidates: [],
        imdbId: null,
        genres: ["Unknown"],
        productionCountries: [],
        directors: [],
        cast: [],
        language: "en-US",
      }),
    } as Response);

    render(
      <UpsertVideoForm
        defaultOwnerId={7}
        initialValues={{ ...baseVideoData, id: 530, genreIds: [] }}
      />
    );

    fireEvent.click(screen.getByTestId("tmdb-refresh-toggle"));
    fireEvent.click(screen.getByTestId("tmdb-refresh-search-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-result-603")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-result-603"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-merge-genre-Unknown")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-merge-genre-Unknown"));
    fireEvent.change(screen.getByTestId("mock-tmdb-merge-manual-genre-select"), {
      target: { value: "26" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-merge-select-genreIds")).toBeChecked();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-merge-apply"));
    fireEvent.click(screen.getByTestId("editable-form-save"));

    await waitFor(() => {
      expect(mockUpsertVideoData).toHaveBeenCalledWith(
        expect.objectContaining({
          genreIds: [26],
        })
      );
    });
  });

  it("loads an existing stored TMDB reference directly while keeping search available", async () => {
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A computer hacker learns about the true nature of reality.",
        releaseDate: "1999-03-31",
        runtime: 136,
        voteAverage: 8.2,
        posterUrl: null,
        backdropUrl: null,
        backdropCandidates: [],
        imdbId: "tt0133093",
        genres: [],
        productionCountries: [],
        directors: [],
        cast: [],
        language: "de-DE",
      }),
    } as Response);

    render(
      <UpsertVideoForm
        defaultOwnerId={7}
        initialValues={{
          ...baseVideoData,
          id: 530,
          imdbID: "tmdb:movie:603",
          language: "",
        }}
      />
    );

    fireEvent.click(screen.getByTestId("tmdb-refresh-toggle"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/tmdb/movie/603", {
        cache: "no-store",
      });
      expect(screen.getByTestId("mock-tmdb-merge-panel")).toBeInTheDocument();
    });
    expect(screen.getByTestId("tmdb-review-back-to-search")).toBeInTheDocument();
    expect(screen.queryByTestId("tmdb-refresh-query")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tmdb-refresh-search-submit")).not.toBeInTheDocument();
  });

  it("does not show a background picker when TMDB returns only one backdrop", async () => {
    mockSearchTmdbMovies.mockResolvedValue([
      {
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A hacker story.",
        releaseDate: "1999-03-31",
        posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
      },
    ]);
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A computer hacker learns about the true nature of reality.",
        releaseDate: "1999-03-31",
        runtime: 136,
        voteAverage: 8.2,
        posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/w342/backdrop.jpg",
        backdropCandidates: [
          {
            filePath: "/backdrop.jpg",
            url: "https://image.tmdb.org/t/p/w342/backdrop.jpg",
            width: 1280,
            height: 720,
            voteAverage: 5.6,
            voteCount: 40,
            iso639_1: "en",
            isPrimary: true,
          },
        ],
        imdbId: "tt0133093",
        genres: [],
        productionCountries: [],
        directors: [],
        cast: [],
        language: "de-DE",
      }),
    } as Response);

    render(<UpsertVideoForm defaultOwnerId={7} />);

    fireEvent.change(screen.getByTestId("tmdb-refresh-query"), {
      target: { value: "Matrix" },
    });
    fireEvent.click(screen.getByTestId("tmdb-refresh-search-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-result-603")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-result-603"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-merge-panel")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("mock-tmdb-backdrop-picker")).not.toBeInTheDocument();
  });

  it("lets the user choose an alternate TMDB background before applying metadata", async () => {
    mockSearchTmdbMovies.mockResolvedValue([
      {
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A hacker story.",
        releaseDate: "1999-03-31",
        posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
      },
    ]);
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 603,
        mediaKind: "movie",
        title: "Matrix",
        originalTitle: "The Matrix",
        overview: "A computer hacker learns about the true nature of reality.",
        releaseDate: "1999-03-31",
        runtime: 136,
        voteAverage: 8.2,
        posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/w342/backdrop.jpg",
        backdropCandidates: [
          {
            filePath: "/backdrop.jpg",
            url: "https://image.tmdb.org/t/p/w342/backdrop.jpg",
            width: 1280,
            height: 720,
            voteAverage: 5.6,
            voteCount: 40,
            iso639_1: "en",
            isPrimary: true,
          },
          {
            filePath: "/backdrop-alt.jpg",
            url: "https://image.tmdb.org/t/p/w342/backdrop-alt.jpg",
            width: 1280,
            height: 720,
            voteAverage: 5.4,
            voteCount: 20,
            iso639_1: "en",
            isPrimary: false,
          },
        ],
        imdbId: "tt0133093",
        genres: [],
        productionCountries: [],
        directors: [],
        cast: [],
        language: "de-DE",
      }),
    } as Response);

    render(<UpsertVideoForm defaultOwnerId={7} />);

    fireEvent.change(screen.getByTestId("tmdb-refresh-query"), {
      target: { value: "Matrix" },
    });
    fireEvent.click(screen.getByTestId("tmdb-refresh-search-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-result-603")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-result-603"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-tmdb-merge-select-title")).toBeInTheDocument();
      expect(screen.getByTestId("mock-tmdb-backdrop-picker")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-tmdb-backdrop-option-1"));
    fireEvent.click(screen.getByTestId("mock-tmdb-merge-apply"));
    await waitFor(() => {
      expect(screen.getByTestId("editable-form-save")).toBeEnabled();
    });
    fireEvent.click(screen.getByTestId("editable-form-save"));

    await waitFor(() => {
      expect(mockUpsertVideoData).toHaveBeenCalledWith(
        expect.objectContaining({
          custom4: "https://image.tmdb.org/t/p/w342/backdrop-alt.jpg",
        })
      );
    });
  });
});

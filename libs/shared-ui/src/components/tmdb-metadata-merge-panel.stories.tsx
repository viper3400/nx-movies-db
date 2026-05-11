import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TmdbMetadataMergePanel } from "./tmdb-metadata-merge-panel";

const baseCandidates = [
  {
    field: "title",
    label: "Title",
    currentValue: "Local Matrix",
    tmdbValue: "The Matrix",
    selected: false,
    conflict: true,
    reason: "different-local" as const,
  },
  {
    field: "plot",
    label: "Plot",
    currentValue: "",
    tmdbValue: "A computer hacker learns about the true nature of reality.",
    selected: true,
    conflict: false,
    reason: "empty-local" as const,
  },
  {
    field: "custom4",
    label: "Background URL",
    currentValue: "",
    tmdbValue: "https://image.tmdb.org/t/p/w780/9TGHDvWrqKBzwDxDodHYXEmOE6J.jpg",
    selected: true,
    conflict: false,
    reason: "empty-local" as const,
  },
];

const backdropCandidates = [
  {
    filePath: "/9TGHDvWrqKBzwDxDodHYXEmOE6J.jpg",
    url: "https://image.tmdb.org/t/p/w780/9TGHDvWrqKBzwDxDodHYXEmOE6J.jpg",
    width: 1280,
    height: 720,
    voteAverage: 5.6,
    voteCount: 40,
    iso639_1: null,
    isPrimary: true,
  },
  {
    filePath: "/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
    url: "https://image.tmdb.org/t/p/w780/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
    width: 1280,
    height: 720,
    voteAverage: 5.3,
    voteCount: 18,
    iso639_1: null,
    isPrimary: false,
  },
  {
    filePath: "/3MshSiF8hk62h1dV1W2I2Y8MshN.jpg",
    url: "https://image.tmdb.org/t/p/w780/3MshSiF8hk62h1dV1W2I2Y8MshN.jpg",
    width: 1280,
    height: 720,
    voteAverage: 5.1,
    voteCount: 12,
    iso639_1: null,
    isPrimary: false,
  },
];

const meta: Meta<typeof TmdbMetadataMergePanel> = {
  component: TmdbMetadataMergePanel,
  title: "TMDB/TmdbMetadataMergePanel",
  args: {
    candidates: baseCandidates,
    tmdbImdbId: "tt0133093",
    backdropCandidates,
    selectedBackdropUrl: backdropCandidates[0].url,
    genreMatches: [],
    availableGenres: [],
    loadingGenres: false,
    genresErrorMessage: null,
    genrePickerTmdbGenre: null,
    onCandidateSelectionChange: fn(),
    onBackdropSelectionChange: fn(),
    onUnmappedGenrePress: fn(),
    onManualGenreSelection: fn(),
    onApplySelected: fn(),
    onNoMatch: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof TmdbMetadataMergePanel>;

export const Default: Story = {};

export const BackgroundSelection: Story = {
  args: {
    candidates: baseCandidates,
    backdropCandidates,
    selectedBackdropUrl: backdropCandidates[1].url,
  },
};

export const GenreMapping: Story = {
  args: {
    candidates: [
      ...baseCandidates,
      {
        field: "genreIds",
        label: "Genres",
        currentValue: [],
        tmdbValue: ["Science Fiction", "Action"],
        selected: true,
        conflict: false,
        reason: "empty-local" as const,
      },
    ],
    backdropCandidates: [backdropCandidates[0]],
    selectedBackdropUrl: backdropCandidates[0].url,
    genreMatches: [
      {
        tmdbGenre: "Science Fiction",
        localGenre: "Sci-Fi",
        localGenreId: 2,
        mappedByAlias: true,
        mappedByManualOverride: false,
      },
      {
        tmdbGenre: "Action",
        localGenre: undefined,
        localGenreId: undefined,
        mappedByAlias: false,
        mappedByManualOverride: false,
      },
    ],
    availableGenres: [
      { label: "Action", value: "1" },
      { label: "Sci-Fi", value: "2" },
      { label: "Thriller", value: "3" },
    ],
    genrePickerTmdbGenre: "Action",
  },
};

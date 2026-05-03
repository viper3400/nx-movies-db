import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
  TmdbImportPreviewPanel,
  type TmdbImportGenreMatch,
  type TmdbImportSelectedMoviePreview,
} from "./tmdb-import-preview-panel";
import type { VideoData } from "@nx-movies-db/shared-types";
import type { CheckboxValue } from "../interfaces";
import type { Selection } from "@react-types/shared";

const availableGenres: CheckboxValue[] = [
  { value: "1", label: "Action" },
  { value: "2", label: "Sci-Fi" },
  { value: "3", label: "Drama" },
  { value: "4", label: "Thriller" },
];

const selectedMoviePreview: TmdbImportSelectedMoviePreview = {
  mediaKind: "movie",
  posterUrl: "https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  imdbId: "tt0133093",
};

const draft: VideoData = {
  id: null,
  title: "The Matrix",
  subtitle: "",
  language: "en",
  country: "United States of America",
  rating: "8.2",
  runtime: 136,
  imdbID: "tt0133093",
  year: 1999,
  imgurl: selectedMoviePreview.posterUrl,
  director: "Lana Wachowski\nLilly Wachowski",
  actors: "Keanu Reeves\nLaurence Fishburne\nCarrie-Anne Moss",
  plot: "A computer hacker learns about the true nature of reality.",
  istv: 0,
  lastupdate: null,
  mediatype: 1,
  owner_id: 1,
  genreIds: [1, 2],
};

const genreMatches: TmdbImportGenreMatch[] = [
  {
    tmdbGenre: "Action",
    localGenre: "Action",
    localGenreId: 1,
    mappedByAlias: false,
    mappedByManualOverride: false,
  },
  {
    tmdbGenre: "Science Fiction",
    localGenre: "Sci-Fi",
    localGenreId: 2,
    mappedByAlias: true,
    mappedByManualOverride: false,
  },
];

const unmappedCyberpunkGenre: TmdbImportGenreMatch = {
  tmdbGenre: "Cyberpunk",
  mappedByAlias: false,
  mappedByManualOverride: false,
};

const meta: Meta<typeof TmdbImportPreviewPanel> = {
  component: TmdbImportPreviewPanel,
  title: "TMDB/TmdbImportPreviewPanel",
  args: {
    isLoading: false,
    selectedMoviePreview,
    draft,
    genreMatches,
    availableGenres,
    loadingGenres: false,
    genresErrorMessage: null,
    genrePickerTmdbGenre: null,
    onUnmappedGenrePress: fn(),
    onManualGenreSelection: fn(),
    onUseMetadata: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof TmdbImportPreviewPanel>;

export const Empty: Story = {
  args: {
    selectedMoviePreview: null,
    draft: null,
    genreMatches: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByTestId("tmdb-preview-panel")).resolves.toBeVisible();
    await expect(canvas.findByTestId("tmdb-preview-empty")).resolves.toBeVisible();
    await expect(canvas.queryByTestId("tmdb-use-metadata")).not.toBeInTheDocument();
  },
};

export const LoadingDetails: Story = {
  args: {
    isLoading: true,
    selectedMoviePreview: null,
    draft: null,
    genreMatches: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByTestId("tmdb-preview-loading")).resolves.toBeVisible();
    await expect(canvas.queryByTestId("tmdb-preview-empty")).not.toBeInTheDocument();
  },
};

export const SelectedMovie: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const preview = await canvas.findByTestId("tmdb-preview-selected-movie");
    await expect(within(preview).findByText("The Matrix")).resolves.toBeVisible();
    await userEvent.click(canvas.getByTestId("tmdb-use-metadata"));
    await expect(args.onUseMetadata).toHaveBeenCalled();
  },
};

export const UnmappedGenre: Story = {
  args: {
    genreMatches: [genreMatches[0], unmappedCyberpunkGenre],
  },
  render: (args) => <InteractiveUnmappedGenreStory {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByTestId("tmdb-preview-genre-cyberpunk"));
    await waitFor(() => expect(canvas.getByTestId("tmdb-manual-genre-select")).toBeVisible());
  },
};

export const GenreLoadError: Story = {
  args: {
    genresErrorMessage: "Could not load local genres.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByTestId("tmdb-preview-panel")).resolves.toBeVisible();
    await expect(canvas.findByTestId("tmdb-use-metadata")).resolves.toBeVisible();
  },
};

function InteractiveUnmappedGenreStory(args: ComponentProps<typeof TmdbImportPreviewPanel>) {
  const [pickerGenre, setPickerGenre] = useState<string | null>(null);
  const [matches, setMatches] = useState<TmdbImportGenreMatch[]>(args.genreMatches);

  const handleManualGenreSelection = (selection: Selection) => {
    if (selection === "all" || !pickerGenre) return;

    const selectedKey = Array.from(selection)[0];
    const selectedGenre = availableGenres.find((genre) => genre.value === String(selectedKey));
    if (!selectedGenre) return;

    setMatches((current) =>
      current.map((match) =>
        match.tmdbGenre === pickerGenre
          ? {
            ...match,
            localGenre: selectedGenre.label,
            localGenreId: Number(selectedGenre.value),
            mappedByAlias: false,
            mappedByManualOverride: true,
          }
          : match
      )
    );
    setPickerGenre(null);
  };

  return (
    <TmdbImportPreviewPanel
      {...args}
      genreMatches={matches}
      genrePickerTmdbGenre={pickerGenre}
      onUnmappedGenrePress={setPickerGenre}
      onManualGenreSelection={handleManualGenreSelection}
    />
  );
}

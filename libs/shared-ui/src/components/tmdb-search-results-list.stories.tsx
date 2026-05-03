import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TmdbSearchResultsList } from "./tmdb-search-results-list";
import type { TmdbSearchResultItem } from "./tmdb-search-result-card";

const movieResults: TmdbSearchResultItem[] = [
  {
    id: 603,
    mediaKind: "movie",
    title: "The Matrix",
    originalTitle: "The Matrix",
    overview: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
    releaseDate: "1999-03-31",
    posterUrl: "https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  },
  {
    id: 604,
    mediaKind: "movie",
    title: "The Matrix Reloaded",
    originalTitle: "The Matrix Reloaded",
    overview: "Neo and the rebel leaders estimate that they have 72 hours until Zion falls under siege.",
    releaseDate: "2003-05-15",
    posterUrl: "https://image.tmdb.org/t/p/w342/9TGHDvWrqKBzwDxDodHYXEmOE6J.jpg",
  },
];

const meta: Meta<typeof TmdbSearchResultsList> = {
  component: TmdbSearchResultsList,
  title: "TMDB/TmdbSearchResultsList",
  args: {
    results: movieResults,
    isLoading: false,
    hasSearched: true,
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof TmdbSearchResultsList>;

export const Loading: Story = {
  args: {
    results: [],
    isLoading: true,
    hasSearched: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByTestId("tmdb-results-list")).resolves.toBeVisible();
    await expect(canvas.findByTestId("tmdb-results-loading")).resolves.toBeVisible();
    await expect(canvas.queryByTestId("tmdb-results-empty")).not.toBeInTheDocument();
  },
};

export const EmptyAfterSearch: Story = {
  args: {
    results: [],
    hasSearched: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByTestId("tmdb-results-empty")).resolves.toBeVisible();
    await expect(canvas.queryByTestId("tmdb-result-card-603")).not.toBeInTheDocument();
  },
};

export const MovieResults: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const list = await canvas.findByTestId("tmdb-results-list");
    await expect(within(list).findByTestId("tmdb-result-card-603")).resolves.toBeVisible();
    await expect(within(list).findByTestId("tmdb-result-card-604")).resolves.toBeVisible();
    await userEvent.click(within(list).getByTestId("tmdb-result-604"));
    await expect(args.onSelect).toHaveBeenCalledWith(movieResults[1]);
  },
};

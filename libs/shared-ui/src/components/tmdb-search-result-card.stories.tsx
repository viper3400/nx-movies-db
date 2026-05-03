import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  TmdbSearchResultCard,
  type TmdbSearchResultItem,
} from "./tmdb-search-result-card";

const matrixResult: TmdbSearchResultItem = {
  id: 603,
  mediaKind: "movie",
  title: "The Matrix",
  originalTitle: "The Matrix",
  overview: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
  releaseDate: "1999-03-31",
  posterUrl: "https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
};

const meta: Meta<typeof TmdbSearchResultCard> = {
  component: TmdbSearchResultCard,
  title: "TMDB/TmdbSearchResultCard",
  args: {
    result: matrixResult,
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof TmdbSearchResultCard>;

export const Movie: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = await canvas.findByTestId("tmdb-result-card-603");
    await expect(within(card).findByTestId("tmdb-result-603")).resolves.toBeVisible();
    await userEvent.click(within(card).getByTestId("tmdb-result-603"));
    await expect(args.onSelect).toHaveBeenCalledWith(matrixResult);
  },
};

export const TvSeries: Story = {
  args: {
    result: {
      id: 1399,
      mediaKind: "tv",
      title: "Game of Thrones",
      originalTitle: "Game of Thrones",
      overview: "Seven noble families fight for control of the mythical land of Westeros.",
      releaseDate: "2011-04-17",
      posterUrl: "https://image.tmdb.org/t/p/w342/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    },
  },
};

export const MissingPoster: Story = {
  args: {
    result: {
      id: 123456,
      mediaKind: "movie",
      title: "Untitled Archive Film",
      originalTitle: "Archivfilm ohne Plakat",
      overview: "A result without poster artwork still keeps the card layout stable.",
      releaseDate: null,
      posterUrl: null,
    },
  },
};

export const OriginalTitle: Story = {
  args: {
    result: {
      ...matrixResult,
      id: 999,
      title: "Life Is Beautiful",
      originalTitle: "La vita e bella",
      releaseDate: "1997-12-20",
      posterUrl: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = await canvas.findByTestId("tmdb-result-card-999");
    await expect(within(card).findByText("La vita e bella")).resolves.toBeVisible();
  },
};

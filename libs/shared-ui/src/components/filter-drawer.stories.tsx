import type { Meta, StoryObj } from "@storybook/react";
import { FilterDrawer } from "./filter-drawer";
import { fn } from "@storybook/test";

const meta: Meta<typeof FilterDrawer> = {
  component: FilterDrawer,
  title: "FilterDrawer",
};
export default meta;
type Story = StoryObj<typeof FilterDrawer>;

export const Default = {
  args: {
    deleteMode: "INCLUDE_DELETED",
    tvSeriesMode: "INCLUDE_TVSERIES",
    isDefaultFilter: true,
    filterForMediaTypes: [],
    filterForGenres: [],
    setTvSeriesMode: fn(),
    setDeleteMode: fn(),
    setFilterForFavorites: fn(),
    setFilterForWatchAgain: fn(),
    setFilterForRandomMovies: fn(),
    setFilterForMediaTypes: fn(),
    setFilterForGenres: fn(),
    mediaTypes:
      [
        { value: 1, label: "DVD" },
        { value: 2, label: "Blue Ray" },
        { value: 3, label: "Blu Ray 3D" },
        { value: 4, label: "HDD" },
        { value: 5, label: "UHD 4K" },
      ],
    genres:
      [
        { value: 1, label: "Comedy" },
        { value: 2, label: "Crime" },
        { value: 3, label: "Drama" },
        { value: 4, label: "Sci-Fi" },
      ]
  },
};

export const NonDefaultFilter = {
  args: {
    deleteMode: "INCLUDE_DELETED",
    tvSeriesMode: "INCLUDE_TVSERIES",
    isDefaultFilter: false,
    genres:
      [
        { value: 1, label: "Comedy" },
        { value: 2, label: "Crime" },
        { value: 3, label: "Drama" },
        { value: 4, label: "Sci-Fi" },
      ],
    mediaTypes:
      [
        { value: 1, label: "DVD" },
        { value: 2, label: "Blue Ray" },
        { value: 3, label: "Blu Ray 3D" },
        { value: 4, label: "HDD" },
        { value: 5, label: "UHD 4K" },
      ],
    filterForMediaTypes: [1, 5],
    filterForGenres: [1, 3],
    setTvSeriesMode: fn(),
    setDeleteMode: fn(),
    setFilterForFavorites: fn(),
    setFilterForWatchAgain: fn(),
    setFilterForRandomMovies: fn(),
    setFilterForMediaTypes: fn(),
    setFilterForGenres: fn()
  },
};

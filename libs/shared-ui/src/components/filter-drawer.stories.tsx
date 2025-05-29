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
    setTvSeriesMode: fn(),
    setDeleteMode: fn(),
    setFilterForFavorites: fn(),
    setFilterForWatchAgain: fn(),
    setFilterForRandomMovies: fn()
  },
};

export const NonDefaultFilter = {
  args: {
    deleteMode: "INCLUDE_DELETED",
    tvSeriesMode: "INCLUDE_TVSERIES",
    isDefaultFilter: false,
    setTvSeriesMode: fn(),
    setDeleteMode: fn(),
    setFilterForFavorites: fn(),
    setFilterForWatchAgain: fn(),
    setFilterForRandomMovies: fn()
  },
};

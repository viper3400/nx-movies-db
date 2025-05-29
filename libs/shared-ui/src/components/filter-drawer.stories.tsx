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
    setTvSeriesMode: fn(),
    setDeleteMode: fn(),
    setFilterForFavorites: fn(),
    setFilterForWatchAgain: fn(),
    setFilterForRandomMovies: fn()
  },
};

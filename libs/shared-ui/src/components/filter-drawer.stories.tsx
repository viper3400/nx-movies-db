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
    labelFilterOptions: "Filter Settings",
    labelClose: "Close",
    labelApply: "Apply",
    labelExcludeDeleted: "Exclude Deleted",
    labelIncludeDeleted: "Include Deleted",
    labelOnlyDeleted: "Only Deleted",
    labelDeleteModeHeading: "Delete Mode",
    favoriteMoviesFilterLabel: "Favorites",
    watchagainMoviesFilterLabel: "Watch Again",
    deleteMode: "INCLUDE_DELETED",
    setDeleteMode: fn(),
    setFilterForFavorites: fn(),
    setFilterForWatchAgain: fn()

  },
};

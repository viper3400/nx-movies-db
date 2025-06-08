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
    setTvSeriesMode: fn(),
    setDeleteMode: fn(),
    setFilterForFavorites: fn(),
    setFilterForWatchAgain: fn(),
    setFilterForRandomMovies: fn(),
    setFilterForMediaTypes: fn(),
    mediaTypes:
      [
        { value: "1", label: "DVD" },
        { value: "2", label: "Blue Ray" },
        { value: "3", label: "Blu Ray 3D" },
        { value: "4", label: "HDD" },
        { value: "5", label: "UHD 4K" },
      ]
  },
};

export const NonDefaultFilter = {
  args: {
    deleteMode: "INCLUDE_DELETED",
    tvSeriesMode: "INCLUDE_TVSERIES",
    isDefaultFilter: false,
    mediaTypes:
      [
        { value: "1", label: "DVD" },
        { value: "2", label: "Blue Ray" },
        { value: "3", label: "Blu Ray 3D" },
        { value: "4", label: "HDD" },
        { value: "5", label: "UHD 4K" },
      ],
    filterForMediaTypes: ["1", "5"],
    setTvSeriesMode: fn(),
    setDeleteMode: fn(),
    setFilterForFavorites: fn(),
    setFilterForWatchAgain: fn(),
    setFilterForRandomMovies: fn(),
    setFilterForMediaTypes: fn()
  },
};

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
    setFilterForRandomMovies: fn(),
    mediaTypes:
      [
        { value: "dvd", label: "DVD" },
        { value: "blue-ray", label: "Blue Ray" },
        { value: "blue-ray-3d", label: "Blu Ray 3D" },
        { value: "hdd", label: "HDD" },
        { value: "UHD", label: "UHD 4K" },
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
        { value: "dvd", label: "DVD" },
        { value: "blue-ray", label: "Blue Ray" },
        { value: "blue-ray-3d", label: "Blu Ray 3D" },
        { value: "hdd", label: "HDD" },
        { value: "uhd", label: "UHD 4K" },
      ],
    filterForMediaTypes: ["dvd", "uhd"],
    setTvSeriesMode: fn(),
    setDeleteMode: fn(),
    setFilterForFavorites: fn(),
    setFilterForWatchAgain: fn(),
    setFilterForRandomMovies: fn(),
    setFilterForMediaTypes: fn()
  },
};

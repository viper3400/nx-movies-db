import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { FilterDrawer } from "./filter-drawer";
import { CheckboxValue, MovieSearchFilters } from "../interfaces";

const mediaTypes: CheckboxValue[] = [
  { value: "1", label: "DVD" },
  { value: "2", label: "Blue Ray" },
  { value: "3", label: "Blu Ray 3D" },
  { value: "4", label: "HDD" },
  { value: "5", label: "UHD 4K" },
];

const genres: CheckboxValue[] = [
  { value: "1", label: "Comedy" },
  { value: "2", label: "Crime" },
  { value: "3", label: "Drama" },
  { value: "4", label: "Sci-Fi" },
];

const defaultFilters: MovieSearchFilters = {
  deleteMode: "INCLUDE_DELETED",
  tvSeriesMode: "INCLUDE_TVSERIES",
  filterForFavorites: false,
  filterForWatchAgain: false,
  filterForMediaTypes: [],
  filterForGenres: [],
  randomExcludeDeleted: true,
};

const nonDefaultFilters: MovieSearchFilters = {
  deleteMode: "INCLUDE_DELETED",
  tvSeriesMode: "INCLUDE_TVSERIES",
  filterForFavorites: false,
  filterForWatchAgain: false,
  filterForMediaTypes: ["1", "5"],
  filterForGenres: ["1", "3"],
  randomExcludeDeleted: false,
};

const meta: Meta<typeof FilterDrawer> = {
  component: FilterDrawer,
  title: "FilterDrawer",
};

export default meta;
type Story = StoryObj<typeof FilterDrawer>;

export const Default: Story = {
  args: {
    filters: defaultFilters,
    setFilters: fn(),
    isDefaultFilter: true,
    mediaTypes,
    genres,
  },
};

export const NonDefaultFilter: Story = {
  args: {
    filters: nonDefaultFilters,
    setFilters: fn(),
    isDefaultFilter: false,
    mediaTypes,
    genres,
  },
};

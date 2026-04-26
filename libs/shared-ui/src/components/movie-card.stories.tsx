import type { Meta, StoryObj } from "@storybook/react-vite";
import { MovieCard } from "./movie-card";
import { expect, waitFor, within } from "storybook/test";

const meta: Meta<typeof MovieCard> = {
  component: MovieCard,
  title: "MovieCard",
};
export default meta;

type Story = StoryObj<typeof MovieCard>;

export const Default: Story = {
  args: {
    movie: {
      id: "1",
      title: "Inception",
      subtitle: "Your mind is the scene of the crime.",
      plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      genres: ["Action", "Sci-Fi", "Thriller"],
      mediaType: "Blu-Ray",
      istv: false,
      diskid: "R12F01D02",
      ownerid: 3,
      runtime: 125,
      rating: "5.7"
    },
    imageUrl: "https://placehold.co/120x180",
    detailsUrl: "/movies/details/1",
    showDetailsButton: true,
    showMarkAsSeenButtons: true,
    loadSeenDatesForMovie: async () => ["2025-04-25", "2025-04-20"],
    loadUserFlagsForMovie: async () => ({
      movieId: "1",
      isFavorite: true,
      isWatchAgain: false,
    }),
    updateFlagsForMovie: async () => {
      console.log("update flags");
    },
    setUserSeenDateForMovie: async () => {
      console.log("set user seen date");
    },
    deleteUserSeenDateForMovie: async () => {
      console.log("delete user seen Date");
    },
    langResources: {
      seenTodayLabel: "Seen Today",
      chooseDateLabel: "Choose Date",
      deletedEntryLabel: "Deleted Entry",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByTestId("seen-today-button")).resolves.toBeVisible();
    await expect(canvas.findByRole("button", { name: "Choose Date" })).resolves.toBeVisible();
    await waitFor(() => expect(canvas.queryAllByTestId("seen_date_chip")).toHaveLength(2));
    await expect(canvas.queryByTestId("deleted-chip")).not.toBeInTheDocument();
  }
};

export const Deleted: Story = {
  args: {
    movie: {
      id: "1",
      title: "Inception",
      subtitle: "Your mind is the scene of the crime.",
      plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      genres: ["Action", "Sci-Fi", "Thriller"],
      mediaType: "Blu-Ray",
      istv: false,
      diskid: "R12F01D02",
      ownerid: 999,
      runtime: 125,
      rating: "5.7"
    },
    imageUrl: "https://placehold.co/120x180",
    detailsUrl: "/movies/details/1",
    showDetailsButton: true,
    showMarkAsSeenButtons: true,
    loadSeenDatesForMovie: async () => ["2025-04-25", "2025-04-20"],
    loadUserFlagsForMovie: async () => ({
      movieId: "1",
      isFavorite: true,
      isWatchAgain: false,
    }),
    updateFlagsForMovie: async () => {
      console.log("update flags");
    },
    setUserSeenDateForMovie: async () => {
      console.log("set user seen date");
    },
    deleteUserSeenDateForMovie: async () => {
      console.log("delete user seen Date");
    },
    langResources: {
      seenTodayLabel: "Seen Today",
      chooseDateLabel: "Choose Date",
      deletedEntryLabel: "Deleted Entry",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByTestId("deleted-chip")).resolves.toBeVisible();
    await expect(canvas.queryByTestId("seen-today-button")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Choose Date" })).not.toBeInTheDocument();
  }
};

export const TextOverflow: Story = {
  args: {
    movie: {
      id: "1",
      title: "Inception",
      subtitle: "Your mind is the scene of the crime.",
      plot: "Dom Cobb is a skilled thief, the absolute best in the dangerous art of extraction: stealing valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable. Cobb's rare ability has made him a coveted player in industrial espionage but has also made him an international fugitive and cost him everything he ever loved. Now Cobb is being offered a chance at redemption. One last job could give him his life back, but only if he can accomplish the impossible—inception. Instead of stealing an idea, Cobb and his team of specialists have to plant one. But no amount of careful planning or expertise can prepare the team for the dangerous enemy that seems to predict their every move, an enemy that only Cobb could have seen coming.",
      genres: ["Action", "Sci-Fi", "Thriller"],
      mediaType: "Blu-Ray",
      istv: false,
      diskid: "R12F01D02",
      ownerid: 3,
      runtime: 125,
      rating: "5.7"
    },
    imageUrl: "https://placehold.co/120x180",
    detailsUrl: "/movies/details/1",
    showDetailsButton: true,
    showMarkAsSeenButtons: true,
    loadSeenDatesForMovie: async () => ["2025-04-25", "2025-04-20"],
    loadUserFlagsForMovie: async () => ({
      movieId: "1",
      isFavorite: true,
      isWatchAgain: false,
    }),
    updateFlagsForMovie: async () => {
      console.log("update flags");
    },
    setUserSeenDateForMovie: async () => {
      console.log("set user seen date");
    },
    deleteUserSeenDateForMovie: async () => {
      console.log("delete user seen Date");
    },
    langResources: {
      seenTodayLabel: "Seen Today",
      chooseDateLabel: "Choose Date",
      deletedEntryLabel: "Deleted Entry",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByTestId("seen-today-button")).resolves.toBeVisible();
    await expect(canvas.findByRole("button", { name: "Choose Date" })).resolves.toBeVisible();
    await waitFor(() => expect(canvas.queryAllByTestId("seen_date_chip")).toHaveLength(2));
    await expect(canvas.queryByTestId("deleted-chip")).not.toBeInTheDocument();
  }
};

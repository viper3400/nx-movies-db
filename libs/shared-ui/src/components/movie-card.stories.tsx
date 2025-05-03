import type { Meta, StoryObj } from "@storybook/react";
import { MovieCard } from "./movie-card";

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
      ownerid: "999",
    },
    imageUrl: "https://placehold.co/120x180",
    appBasePath: "/movies",
    showDetailsButton: true,
    showMarkAsSeenButtons: true,
    loadSeenDatesForMovie: async () => ["2025-04-25", "2025-04-20"],
    loadUserFlagsForMovie: async () => ({
      movieId: "1",
      isFavorite: true,
      isWatchAgain: false,
    }),
    updateFlagsForMovie: async () => { console.log("update flags"); },
    setUserSeenDateForMovie: async () => { console.log("set user seen date"); },
    deleteUserSeenDateForMovie: async () => { console.log("delete user seen Date"); },
    langResources: {
      seenTodayLabel: "Seen Today",
      chooseDateLabel: "Choose Date",
      deletedEntryLabel: "Deleted Entry",
    }
  },
  tags: ["!test"]
};

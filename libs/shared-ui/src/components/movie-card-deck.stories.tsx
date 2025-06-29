import type { Meta, StoryObj } from "@storybook/react-vite";
import { MovieCardDeck } from "./movie-card-deck";

const meta: Meta<typeof MovieCardDeck> = {
  component: MovieCardDeck,
  title: "MovieCardDeck",
};
export default meta;

type Story = StoryObj<typeof MovieCardDeck>;

const imagePlaceholderUrl = "https://placehold.co/120x180";
export const Default: Story = {
  args: {
    movies: [
      {
        id: "1",
        title: "Inception",
        subtitle: "Your mind is the scene of the crime.",
        plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        genres: ["Action", "Sci-Fi"],
        mediaType: "Movie",
        istv: false,
        ownerid: 123,
        diskid: "D001",
      },
      {
        id: "2",
        title: "The Dark Knight",
        subtitle: "Why so serious?",
        plot: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
        genres: ["Action", "Drama"],
        mediaType: "Movie",
        istv: false,
        ownerid: 123,
        diskid: "D002",
      },
      {
        id: "3",
        title: "Interstellar",
        subtitle: "Mankind was born on Earth. It was never meant to die here.",
        plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        genres: ["Adventure", "Drama", "Sci-Fi"],
        mediaType: "Movie",
        istv: false,
        ownerid: 123,
        diskid: "D003",
      },
    ],
    imageBaseUrl: "",
    appBasePath: "/movies",
    loadSeenDatesForMovie: async (movieId: string) => {
      return ["2025-04-01", "2025-04-15"];
    },
    loadUserFlagsForMovie: async (movieId: string) => {
      return { movieId, isFavorite: false, isWatchAgain: true };
    },
    updateFlagsForMovie: async (flags) => {
      console.log("Updated flags:", flags);
    },
    setUserSeenDateForMovie: async (movieId, date) => {
      console.log(`Set seen date for movie ${movieId}:`, date);
    },
    deleteUserSeenDateForMovie: async (movieId, date) => {
      console.log(`Deleted seen date for movie ${movieId}:`, date);
    },
    movieCardLangResources: {
      seenTodayLabel: "Seen Today",
      chooseDateLabel: "Choose Date",
      deletedEntryLabel: "Deleted Entry",
    },
  },
  tags: ["!test"],
};

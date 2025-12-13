import { prisma } from "@nx-movies-db/movies-prisma-lib";

export const getGenres = async () => {
  const genres = await prisma.videodb_genres.findMany({
    select: {
      id: true,
      name: true
    }
  });
  return genres;
};

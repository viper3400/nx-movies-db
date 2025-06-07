import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getGenres = async () => {
  const genres = await prisma.videodb_genres.findMany({
    select: {
      id: true,
      name: true
    }
  });
  return genres;
};

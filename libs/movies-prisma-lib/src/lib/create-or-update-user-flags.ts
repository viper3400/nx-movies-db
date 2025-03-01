import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createOrUpdateUserFlag = async (args: {
  movieId: number;
  isWatchAgain: boolean;
  isFavorite: boolean;
  userName: string;
}) => {
  const existingEntry = await prisma.homewebbridge_usermoviesettings.findFirst({
    where: {
      vdb_movieid: args.movieId,
      asp_username: args.userName,
    },
  });

  if (existingEntry) {
    if (!args.isWatchAgain && !args.isFavorite) {
      await prisma.homewebbridge_usermoviesettings.delete({
        where: {
          id: existingEntry.id,
        },
      });
      return null;
    } else {
      return await prisma.homewebbridge_usermoviesettings.update({
        where: {
          id: existingEntry.id,
        },
        data: {
          watchagain: args.isWatchAgain,
          is_favorite: args.isFavorite,
        },
      });
    }
  } else {
    return await prisma.homewebbridge_usermoviesettings.create({
      data: {
        vdb_movieid: args.movieId,
        watchagain: args.isWatchAgain,
        is_favorite: args.isFavorite,
        asp_username: args.userName,
      },
    });
  }
};

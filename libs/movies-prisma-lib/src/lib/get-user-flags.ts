// videoQueries.ts
import { prisma } from "../prismaclient";

export type UserFlagsForMovieArgs = {
  movieId: number;
  userName: string;
};

export const getUserFlagsForUser = async (args: UserFlagsForMovieArgs, query: any) => {
  const { movieId, userName } = args;

  return await prisma.homewebbridge_usermoviesettings.findMany({
    where: {
      vdb_movieid: movieId,
      asp_username: userName
    },
    select: {
      vdb_movieid: true,
      is_favorite: true,
      watchagain: true,
      asp_username: true
    },
    ...query,
  });
};

// videoQueries.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type VideoSeenDateArgs = {
  movieId: number;
  viewGroup: string;
};

export const getSeenDates = async (args: VideoSeenDateArgs, query: any) => {
  const { movieId, viewGroup } = args;

  return await prisma.homewebbridge_userseen.findMany({
    where: {
      vdb_videoid: movieId,
      asp_viewgroup: viewGroup
    },
    select: {
      asp_username: true,
      viewdate: true
    },
    ...query,
  });
};

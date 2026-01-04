// videoQueries.ts
import { prisma } from "../prismaclient";

export type VideoSeenDateArgs = {
  movieId: number;
  viewGroup: string;
  sortOrder?: string;
};

export const getSeenDates = async (args: VideoSeenDateArgs, query: any) => {
  const { movieId, viewGroup, sortOrder = "asc" } = args;

  return await prisma.homewebbridge_userseen.findMany({
    where: {
      vdb_videoid: movieId,
      asp_viewgroup: viewGroup
    },
    select: {
      asp_username: true,
      viewdate: true
    },
    orderBy: {
      viewdate: sortOrder
    },
    ...query
  });
};

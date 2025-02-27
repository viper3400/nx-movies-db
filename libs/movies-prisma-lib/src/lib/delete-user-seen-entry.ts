import prisma from "./prisma-client";

export const deleteUserSeenEntry = async (args: {
  movieId: number;
  viewGroup: string;
  viewDate: Date;
}) => {
  const dateCount = await prisma.homewebbridge_userseen.count({
    where: {
      vdb_videoid: args.movieId,
      asp_viewgroup: args.viewGroup,
      viewdate: args.viewDate
    }
  });

  if (dateCount > 1) throw new Error("Data inconsistency: Found two seen date for one view group at the same day.");

  return await prisma.homewebbridge_userseen.deleteMany({
    where: {
      vdb_videoid: args.movieId,
      asp_viewgroup: args.viewGroup,
      viewdate: args.viewDate
    }
  });
};

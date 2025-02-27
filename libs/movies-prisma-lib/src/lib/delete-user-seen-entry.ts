import prisma from "./prisma-client";

export const deleteUserSeenEntry = async (args: {
  movieId: number;
  viewGroup: string;
  viewDate: Date;
}) => {
  const startOfDay = new Date(Date.UTC(args.viewDate.getUTCFullYear(), args.viewDate.getUTCMonth(), args.viewDate.getUTCDate(), 0, 0, 0, 0)); // Set to the start of the day (00:00:00 UTC)
  const endOfDay = new Date(Date.UTC(args.viewDate.getUTCFullYear(), args.viewDate.getUTCMonth(), args.viewDate.getUTCDate(), 23, 59, 59, 999)); // Set to the end of the day (23:59:59.999 UTC)

  const dateCount = await prisma.homewebbridge_userseen.count({
    where: {
      vdb_videoid: args.movieId,
      asp_viewgroup: args.viewGroup,
      viewdate: {
        gte: startOfDay, // Includes 00:00:00
        lte: endOfDay // Excludes 00:00:00 of the next day
      }
    }
  });

  if (dateCount > 1) throw new Error("Data inconsistency: Found two seen date for one view group at the same day.");

  return await prisma.homewebbridge_userseen.deleteMany({
    where: {
      vdb_videoid: args.movieId,
      asp_viewgroup: args.viewGroup,
      viewdate: {
        gte: startOfDay, // Includes 00:00:00
        lte: endOfDay // Excludes 00:00:00 of the next day
      }
    }
  });
};

import prisma from "./prisma-client";

export const createUserSeenEntry = async (args: {
  movieId: number;
  userName: string;
  viewGroup: string;
  viewDate: Date;
}) => {
  const startOfDay = new Date(Date.UTC(args.viewDate.getUTCFullYear(), args.viewDate.getUTCMonth(), args.viewDate.getUTCDate(), 0, 0, 0, 0)); // Set to the start of the day (00:00:00 UTC)
  const endOfDay = new Date(Date.UTC(args.viewDate.getUTCFullYear(), args.viewDate.getUTCMonth(), args.viewDate.getUTCDate(), 23, 59, 59, 999)); // Set to the end of the day (23:59:59.999 UTC)

  const exists = await prisma.homewebbridge_userseen.count({
    where: {
      vdb_videoid: args.movieId,
      asp_viewgroup: args.viewGroup,
      viewdate: {
        gte: startOfDay, // Includes 00:00:00
        lte: endOfDay // Excludes 00:00:00 of the next day
      }
    }
  });

  if (exists) throw new Error("cannot set movie seen for same viewgroup twice a day.");

  return await prisma.homewebbridge_userseen.create({
    data: {
      vdb_videoid: args.movieId,
      asp_viewgroup: args.viewGroup,
      asp_username: args.userName,
      viewdate: args.viewDate
    }
  });
};

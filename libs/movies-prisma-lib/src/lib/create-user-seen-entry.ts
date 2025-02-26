import prisma from "./prisma-client";

export const createUserSeenEntry = async (args: {
  movieId: number;
  userName: string;
  viewGroup: string;
  viewDate: Date;
}) => {
  const exists = await prisma.homewebbridge_userseen.findFirst({
    where: {
      vdb_videoid: args.movieId,
      asp_viewgroup: args.viewGroup,
      viewdate: args.viewDate
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

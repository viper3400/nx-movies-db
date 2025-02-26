import prisma from "./prisma-client";

export const deleteUserSeenEntry = async (args: {
  movieId: number;
  viewGroup: string;
  viewDate: Date;
}) => {
  return await prisma.homewebbridge_userseen.deleteMany({
    where: {
      vdb_videoid: args.movieId,
      asp_viewgroup: args.viewGroup,
      viewdate: args.viewDate
    }
  });
};

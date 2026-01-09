import { prisma } from "../prismaclient";

export const getVideoById = async (id: number) => {
  return prisma.videodb_videodata.findUnique({
    where: { id },
    include: {
      videodb_videogenre: {
        include: {
          genre: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      videodb_mediatypes: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

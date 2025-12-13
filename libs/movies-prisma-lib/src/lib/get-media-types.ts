import { prisma } from "@nx-movies-db/movies-prisma-lib";

export const getMediaTypes = async () => {
  const mediaTypes = await prisma.videodb_mediatypes.findMany({
    select: {
      id: true,
      name: true
    }
  });
  return mediaTypes;
};

import { prisma } from "../prismaclient";

export const getMediaTypes = async () => {
  const mediaTypes = await prisma.videodb_mediatypes.findMany({
    select: {
      id: true,
      name: true
    }
  });
  return mediaTypes;
};

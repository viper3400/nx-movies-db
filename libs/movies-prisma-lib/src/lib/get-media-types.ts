import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getMediaTypes = async () => {
  const mediaTypes = await prisma.videodb_mediatypes.findMany({
    select: {
      id: true,
      name: true
    }
  });
  return mediaTypes;
};

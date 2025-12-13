import { videodb_videodata } from "@prisma/client";
import { prisma } from "@nx-movies-db/movies-prisma-lib";

export type VideoDataInput = Partial<Omit<videodb_videodata, "id">> & { id?: number };

export async function upsertVideoData(data: VideoDataInput): Promise<videodb_videodata> {
  const { id, ...rest } = data;

  if (id) {
    // Update existing record by id
    return prisma.videodb_videodata.update({
      where: { id },
      data: { ...rest },
    });
  } else {
    // Create new record, let DB generate id
    return prisma.videodb_videodata.create({
      data: { ...rest },
    });
  }
}

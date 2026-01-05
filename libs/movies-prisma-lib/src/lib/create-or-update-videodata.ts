import type { Prisma } from "../generated/client";
import { prisma } from "../prismaclient";

type VideoData = Awaited<ReturnType<typeof prisma.videodb_videodata.create>>;
type ScalarVideoDataInput = Omit<
  Prisma.videodb_videodataUncheckedCreateInput,
  "id" | "videodb_videogenre" | "userSeen" | "userMovieSettings"
>;

export type VideoDataInput = ScalarVideoDataInput & {
  id?: number;
};

export async function upsertVideoData(data: VideoDataInput): Promise<VideoData> {
  const { id, ...rest } = data;

  if (id) {
    // Update existing record by id
    return prisma.videodb_videodata.update({
      where: { id },
      data: rest,
    });
  } else {
    // Create new record, let DB generate id
    return prisma.videodb_videodata.create({
      data: rest,
    });
  }
}

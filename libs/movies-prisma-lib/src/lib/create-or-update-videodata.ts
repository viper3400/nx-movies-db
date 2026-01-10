import type { Prisma } from "../generated/client";
import { prisma } from "../prismaclient";

type VideoData = Awaited<ReturnType<typeof prisma.videodb_videodata.create>>;
type ScalarVideoDataInput = Omit<
  Prisma.videodb_videodataUncheckedCreateInput,
  "id" | "videodb_videogenre" | "userSeen" | "userMovieSettings"
>;

export type VideoDataInput = ScalarVideoDataInput & {
  id?: number;
  genreIds?: number[];
};

export async function upsertVideoData(data: VideoDataInput): Promise<VideoData> {
  const { id, genreIds, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    const video = id
      ? await tx.videodb_videodata.update({
        where: { id },
        data: rest,
      })
      : await tx.videodb_videodata.create({
        data: rest,
      });

    if (genreIds) {
      await tx.videodb_videogenre.deleteMany({ where: { video_id: video.id } });
      if (genreIds.length > 0) {
        const uniqueGenreIds = [...new Set(genreIds)];
        await tx.videodb_videogenre.createMany({
          data: uniqueGenreIds.map((genre_id) => ({
            video_id: video.id,
            genre_id,
          })),
        });
      }
    }

    return video;
  });
}

import { prisma } from "../prismaclient";

type VideoData = Awaited<ReturnType<typeof prisma.videodb_videodata.create>>;
type VideoDataCreateArgs = Parameters<typeof prisma.videodb_videodata.create>[0];

export type VideoDataInput = Partial<Omit<VideoDataCreateArgs["data"], "id" | "mediatype">> & {
  id?: number;
  // Prisma likely models `mediatype` as a relation, not a scalar. Keep this for caller compatibility,
  // but do not forward it to Prisma `data`.
  mediatype?: number;
};

export async function upsertVideoData(data: VideoDataInput): Promise<VideoData> {
  const { id, mediatype: _mediatype, ...rest } = data;

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

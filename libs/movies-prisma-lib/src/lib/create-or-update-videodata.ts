import type { Prisma } from "../generated/client";
import { prisma } from "../prismaclient";
import { z } from "zod";

type VideoData = Awaited<ReturnType<typeof prisma.videodb_videodata.create>>;
type ScalarVideoDataInput = Omit<
  Prisma.videodb_videodataUncheckedCreateInput,
  "id" | "videodb_videogenre" | "userSeen" | "userMovieSettings"
>;

type RequiredVideoDataFields = {
  [K in "year" | "istv" | "mediatype" | "owner_id"]-?: NonNullable<ScalarVideoDataInput[K]>;
};

type OptionalVideoDataFields = Omit<ScalarVideoDataInput, keyof RequiredVideoDataFields>;

export type VideoDataInput = OptionalVideoDataFields & RequiredVideoDataFields & {
  id?: number;
  genreIds?: number[];
};

const dateTimeSchema = z.union([z.date(), z.string().datetime()]);

const videoDataInputSchema: z.ZodType<VideoDataInput> = z
  .object({
    id: z.number().int().positive().optional(),
    year: z.number().int().min(0).max(9999),
    istv: z.number().int().min(0),
    mediatype: z.number().int().min(1),
    owner_id: z.number().int().min(1),
    genreIds: z.array(z.number().int().positive()).optional(),
    lastupdate: dateTimeSchema.optional(),
    created: dateTimeSchema.optional(),
    filedate: dateTimeSchema.optional(),
  })
  .passthrough();

export class VideoDataValidationError extends Error {
  constructor(public readonly issues: z.ZodIssue[]) {
    super("Invalid video data input");
    this.name = "VideoDataValidationError";
  }
}

export function parseVideoDataInput(data: VideoDataInput): VideoDataInput {
  const parsed = videoDataInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new VideoDataValidationError(parsed.error.issues);
  }
  return parsed.data;
}

export async function upsertVideoData(data: VideoDataInput): Promise<VideoData> {
  const parsed = parseVideoDataInput(data);
  const { id, genreIds, ...rest } = parsed;
  const normalizedGenreIds = genreIds ? [...new Set(genreIds)] : undefined;

  return prisma.$transaction(async (tx) => {
    const video = id
      ? await tx.videodb_videodata.update({
        where: { id },
        data: rest,
      })
      : await tx.videodb_videodata.create({
        data: rest,
      });

    if (normalizedGenreIds) {
      await tx.videodb_videogenre.deleteMany({ where: { video_id: video.id } });
      if (normalizedGenreIds.length > 0) {
        await tx.videodb_videogenre.createMany({
          data: normalizedGenreIds.map((genre_id) => ({
            video_id: video.id,
            genre_id,
          })),
        });
      }
    }

    return video;
  });
}

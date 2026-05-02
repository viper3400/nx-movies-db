import type { Prisma } from "../generated/client";
import { prisma } from "../prismaclient";
import { z } from "zod";
import {
  isPhysicalMediaTypeName,
  isValidDiskId,
  normalizeDiskId,
} from "@nx-movies-db/shared-types";

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

function diskIdIssue(message: string): z.ZodIssue {
  return {
    code: "custom",
    path: ["diskid"],
    message,
  };
}

export function parseVideoDataInput(data: VideoDataInput): VideoDataInput {
  const parsed = videoDataInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new VideoDataValidationError(parsed.error.issues);
  }
  return {
    ...parsed.data,
    diskid: normalizeDiskId(parsed.data.diskid) ?? undefined,
  };
}

export async function validateDiskIdForPersistence(data: VideoDataInput): Promise<VideoDataInput> {
  const normalizedDiskId = normalizeDiskId(data.diskid);
  const issues: z.ZodIssue[] = [];

  const mediaType = await prisma.videodb_mediatypes.findUnique({
    where: { id: data.mediatype },
    select: { name: true },
  });
  const requiresDiskId = isPhysicalMediaTypeName(mediaType?.name);

  if (normalizedDiskId && !isValidDiskId(normalizedDiskId)) {
    issues.push(diskIdIssue("Disk ID must match RxxFyDzz, for example R01F3D04."));
  }

  if (requiresDiskId && !normalizedDiskId) {
    issues.push(diskIdIssue("Disk ID is required for physical media types."));
  }

  if (normalizedDiskId && isValidDiskId(normalizedDiskId)) {
    const existing = await prisma.videodb_videodata.findFirst({
      where: {
        diskid: normalizedDiskId,
        ...(data.id ? { id: { not: data.id } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      issues.push(diskIdIssue("Disk ID is already used by another movie."));
    }
  }

  if (issues.length > 0) {
    throw new VideoDataValidationError(issues);
  }

  return {
    ...data,
    diskid: normalizedDiskId ?? undefined,
  };
}

export async function upsertVideoData(data: VideoDataInput): Promise<VideoData> {
  const parsed = await validateDiskIdForPersistence(parseVideoDataInput(data));
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

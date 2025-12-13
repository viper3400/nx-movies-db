import { prisma } from "@nx-movies-db/movies-prisma-lib";
import { Video } from "../types";

/**
 * Delete a videodb_videodata record by its ID.
 * @param id - The ID of the video to delete.
 * @returns The deleted videodb_videodata record.
 * @throws If no record with the given ID exists.
 */
export async function deleteVideoData(id: number): Promise<Video> {
  return prisma.videodb_videodata.delete({
    where: { id },
  });
}

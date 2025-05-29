// videoQueries.ts
import { PrismaClient } from "@prisma/client";
import { Video, VideoQueryArgs } from "../types";
import { buildWhereClause } from "../helpers";

const prisma = new PrismaClient();

export const getVideos = async (args: VideoQueryArgs, query: any) => {
  const { queryPlot, queryUserSettings, take, skip } = args;

  const where = buildWhereClause(args);

  const totalCount = await prisma.videodb_videodata.count({
    where: where
  });

  const videos: Video[] = await prisma.videodb_videodata.findMany({
    where: where,
    select: {
      id: true,
      subtitle: true,
      title: true,
      diskid: true,
      owner_id: true,
      istv: true,
      plot: queryPlot,
      videodb_videogenre: {
        select: {
          genre: {
            select: {
              name: true,
            },
          },
        },
      },
      videodb_mediatypes: {
        select: {
          name: true,
        },
      },
      userMovieSettings: queryUserSettings ? {
        select: {
          is_favorite: true,
          watchagain: true,
          asp_username: true
        }
      } : false
    },
    take: take,
    skip: skip,
    orderBy: {
      title: "asc"
    },
    ...query,
  });
  const result = {
    videos, totalCount
  };
  return result;
};

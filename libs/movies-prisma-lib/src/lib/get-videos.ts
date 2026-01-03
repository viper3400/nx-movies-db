// videoQueries.ts
import { prisma } from "../prismaclient";
import { Video, VideoQueryArgs } from "../types";
import { buildWhereClause } from "../helpers";

export const getVideos = async (args: VideoQueryArgs, query: any) => {
  const { queryPlot, queryUserSettings, randomOrder, take, skip } = args;

  let where = buildWhereClause(args);

  if (randomOrder) {
    const allIds = await prisma.videodb_videodata.findMany({
      where: where,
      select: {
        id: true
      }
    });
    // Shuffle allIds and take the first 10
    const shuffledIds = allIds
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value.id)
      .slice(0, 10);

    const shuffledIdsAsStrings = shuffledIds.map(id => id.toString());
    const newArgs = { ...args, ids: shuffledIdsAsStrings };
    where = buildWhereClause(newArgs);
  }

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
      runtime: true,
      rating: true,
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

// videoQueries.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type VideoQueryArgs = {
  id?: string;          // Optional string for filtering by id
  title?: string;       // Optional string for filtering by title
  diskid?: string;      // Optional string for filtering by disk ID
  genreName?: string;   // Optional string for filtering by genre name
  mediaType?: string[]; // Optional array of strings for filtering by media type
  ownerid?: string;     // Optional string for filtering by owner ID
  queryPlot?: boolean;
  queryUserSettings?: boolean;
  filterFavorites?: boolean;
  filterFlagged?: boolean;
  userName?: string;
  deleteMode?: string;
  skip?: number;
  take?: number;
  //deleteMode?: 'ONLY_DELETED' | 'INCLUDE_DELETED' | 'EXCLUDE_DELETED'; // New deleteMode parameter
};

type Video = {
  id: number;
  subtitle?: string | null;
  title?: string | null;
  diskid?: string | null;
  owner_id: number;
  plot?: string | null;
  videodb_videogenre?: {
    genre: {
      name: string;
    };
  }[] | null;
  videodb_mediatypes?: {
    name: string;
  } | null;
  userMovieSettings?: {
    is_favorite: boolean;
    watchagain: boolean;
    asp_username: string;
  }[] | null
};

export const getVideos = async (args: VideoQueryArgs, query: any) => {
  const { id, title, diskid, genreName, mediaType, ownerid, queryPlot, queryUserSettings, userName, filterFavorites, filterFlagged, deleteMode, take, skip } = args;

  if ((filterFlagged || filterFavorites) && !userName) {
    throw new Error("Username must be set");
  }

  const where = {
    AND: [
      {
        OR: [
          { title: title ? { contains: title } : undefined },
          { subtitle: title ? { contains: title } : undefined },
        ],
      },
      {
        id: id ? { equals: parseInt(id, 10) } : undefined,
      },
      {
        owner_id: ownerid ? { equals: parseInt(ownerid, 10) } : undefined,
      },
      { diskid: diskid ? { startsWith: diskid } : undefined },
      genreName ? {
        videodb_videogenre: {
          some: {
            genre: {
              name: genreName ? { contains: genreName } : undefined,
            },
          },
        },
      } : {},
      {
        videodb_mediatypes: {
          name: mediaType ? { in: mediaType } : undefined,
        },
      },
      // Handle deleteMode logic
      deleteMode === "ONLY_DELETED" ? {
        owner_id: { equals: 999 },
      } : deleteMode === "EXCLUDE_DELETED" ? {
        owner_id: { not: 999 },
      } : {}, // INCLUDE_DELETED will not add any additional filters
      userName && filterFavorites ? {
        userMovieSettings: {
          some: {
            asp_username: userName,
            is_favorite: true,
          },
        },
      } : {},
      userName && filterFlagged ? {
        userMovieSettings: {
          some: {
            asp_username: userName,
            watchagain: true,
          },
        },
      } : {},
    ],
  };
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
    ...query,
  });
  const result = {
    videos, totalCount
  };
  return result;
};

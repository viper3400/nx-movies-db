// videoQueries.ts
import { prisma } from "../prismaclient";
import { Video, VideoQueryArgs } from "../types";
import { buildWhereClause } from "../helpers";

const DEFAULT_RANDOM_PAGE_SIZE = 10;

type RandomVideoSelection = {
  selectedIds: number[];
  totalCount: number;
};

export const getVideoSearchRank = (video: Video, searchText: string) => {
  const query = searchText.toLocaleLowerCase();
  const title = video.title?.toLocaleLowerCase();

  if (title === query) {
    return 0;
  }

  if (title?.startsWith(query)) {
    return 1;
  }

  if (title?.includes(query)) {
    return 2;
  }

  return 3;
};

export const rankVideosBySearch = (videos: Video[], searchText: string) =>
  [...videos].sort((left, right) => {
    const rankDifference = getVideoSearchRank(left, searchText) - getVideoSearchRank(right, searchText);
    if (rankDifference !== 0) {
      return rankDifference;
    }

    const titleDifference = (left.title ?? "").localeCompare(right.title ?? "", undefined, { sensitivity: "base" });
    return titleDifference !== 0 ? titleDifference : left.id - right.id;
  });

export const shuffleIds = (ids: number[]) => {
  const shuffled = [...ids];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const selectRandomVideoIds = async (args: VideoQueryArgs): Promise<RandomVideoSelection> => {
  const take = args.take ?? DEFAULT_RANDOM_PAGE_SIZE;
  let excludedIds = [...(args.excludedIds ?? [])];
  let candidateIds: number[] = [];

  while (true) {
    const candidates = await prisma.videodb_videodata.findMany({
      where: buildWhereClause({ ...args, excludedIds }),
      select: {
        id: true,
      },
    });
    candidateIds = candidates.map(({ id }) => id);

    if (candidateIds.length >= take || excludedIds.length === 0) {
      break;
    }

    excludedIds = excludedIds.slice(1);
  }

  return {
    selectedIds: shuffleIds(candidateIds).slice(0, take),
    totalCount: Math.min(candidateIds.length, take),
  };
};

export const getVideos = async (args: VideoQueryArgs, query: any) => {
  const { queryPlot, queryUserSettings, randomOrder, take, skip } = args;
  const titleSearchText = args.title?.trim();
  const shouldRankByTitle = !randomOrder && Boolean(titleSearchText);

  let where = buildWhereClause(args);
  let randomSelectedIds: number[] | undefined;
  let totalCount: number;

  if (randomOrder) {
    const randomSelection = await selectRandomVideoIds(args);
    randomSelectedIds = randomSelection.selectedIds;
    totalCount = randomSelection.totalCount;

    const newArgs = {
      ...args,
      ids: randomSelectedIds.map(id => id.toString()),
      excludedIds: undefined,
    };
    where = buildWhereClause(newArgs);
  } else {
    totalCount = await prisma.videodb_videodata.count({
      where: where
    });
  }

  const fetchedVideos: Video[] = await prisma.videodb_videodata.findMany({
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
    take: shouldRankByTitle ? undefined : take,
    skip: shouldRankByTitle ? undefined : skip,
    orderBy: randomOrder ? undefined : {
      title: "asc"
    },
    ...query,
  });

  const videos = shouldRankByTitle
    ? rankVideosBySearch(fetchedVideos, titleSearchText!).slice(
      skip ?? 0,
      take === undefined ? undefined : (skip ?? 0) + take,
    )
    : fetchedVideos;

  const orderedVideos: Video[] = randomSelectedIds
    ? randomSelectedIds
      .map(id => videos.find(video => video.id === id))
      .filter((video): video is NonNullable<typeof video> => Boolean(video))
    : videos;

  const result = {
    videos: orderedVideos, totalCount
  };
  return result;
};

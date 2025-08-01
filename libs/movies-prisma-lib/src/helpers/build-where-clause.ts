import { VideoQueryArgs } from "../types";

export const buildWhereClause = (args: VideoQueryArgs): any => {
  const { ids, title, diskid, genreName, mediaType, ownerid, userName, filterFavorites, filterFlagged, deleteMode, tvSeriesMode } = args;

  if ((filterFlagged || filterFavorites) && !userName) {
    throw new Error("Username must be set");
  }

  // Helper for tvSeriesMode
  const tvSeriesFilter =
    tvSeriesMode === "ONLY_TVSERIES"
      ? { istv: { equals: 1 } }
      : tvSeriesMode === "EXCLUDE_TVSERIES"
        ? { istv: { equals: 0 } }
        : {};

  return {
    AND: [
      {
        OR: [
          { title: title ? { contains: title } : undefined },
          { subtitle: title ? { contains: title } : undefined },
        ],
      },
      {
        id: ids ? { in: ids.map((id) => parseInt(id, 10)) } : undefined,
      },
      {
        owner_id: ownerid ? { equals: parseInt(ownerid, 10) } : undefined,
      },
      { diskid: diskid ? { startsWith: diskid } : undefined },
      genreName && genreName.length > 0 ? {
        videodb_videogenre: {
          some: {
            genre: {
              name: genreName ? { in: genreName } : undefined,
            },
          },
        },
      } : {},
      {
        videodb_mediatypes: {
          name: mediaType && mediaType.length > 0 ? { in: mediaType } : undefined,
        },
      },
      // Handle deleteMode logic
      deleteMode === "ONLY_DELETED" ? {
        owner_id: { equals: 999 },
      } : deleteMode === "EXCLUDE_DELETED" ? {
        owner_id: { not: 999 },
      } : {}, // INCLUDE_DELETED will not add any additional filters
      tvSeriesFilter,
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
};

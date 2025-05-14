import { getSeenList, GetSeenListArgs, getVideos } from "@nx-movies-db/movies-prisma-lib";
import { builder } from "../builder";
import { RequestMeta, SeenEntry } from "../objects";

const SeenEntries = builder.simpleObject("SeenEntries", {
  fields: (t) => ({
    requestMeta: t.field({
      type: RequestMeta
    }),
    SeenEntries: t.field({
      type: [SeenEntry],
      description: "Query to fetch seen entries",
    }),
  })
});

builder.queryType({
  fields: (t) => ({
    seenVideos: t.field({
      type: SeenEntries,
      args: {
        viewGroup: t.arg.string(),
        fromDate: t.arg.string(),
        toDate: t.arg.string(),
        queryPlot: t.arg.boolean({
          description: "Include plot in the result",
        }),
        queryUserSettings: t.arg.boolean({
          description: "Include user movie settings in the result",
        }),
        skip: t.arg.int({
          description: "Elements to skip"
        }),
        take: t.arg.int({
          description: "Elements to take"
        })
      },
      resolve: async (_parent, args, _ctx: any) => {
        const seenData = await getSeenList(args as GetSeenListArgs, null);
        const mappedSeenData = await Promise.all(seenData.movies.map(async (entry) => {
          const videos = await getVideos({
            id: entry.vdb_videoid.toString(),
            queryPlot: args.queryPlot ?? false,
            queryUserSettings: args.queryUserSettings ?? false
          }, undefined);
          const video = videos.videos[0];
          return {
            viewDate: entry.viewdate.toISOString(),
            userName: entry.asp_username,
            movieId: entry.vdb_videoid,
            video: {
              id: video.id,
              title: video.title,
              subtitle: video.subtitle,
              diskid: video.diskid,
              ownerid: video.owner_id,
              istv: Boolean(video.istv),
              plot: video.plot,
              favoriteOf: video.userMovieSettings?.map((setting) => setting.asp_username) || [],
              genres: video.videodb_videogenre?.map((genre) => genre.genre.name) || [],
              mediaType: video.videodb_mediatypes?.name || null
            }
          };
        }));

        const count = seenData.totalCount;

        return {
          requestMeta: {
            totalCount: count,
          },
          SeenEntries: mappedSeenData,
        };
      },
    })
  }
  )
});

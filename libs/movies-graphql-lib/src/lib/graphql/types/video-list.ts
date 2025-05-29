import { builder } from "../builder";
import { getVideos } from "@nx-movies-db/movies-prisma-lib";
import type { VideoQueryArgs } from "@nx-movies-db/movies-prisma-lib";
import { DeleteMode, TvSeriesMode, Videos } from "../objects";

builder.queryType({
  fields: (t) => ({
    videos: t.field({
      type: Videos,
      args: {
        ids: t.arg.stringList({
          description: "Filter videos by ids",
        }),
        title: t.arg.string({
          description: "Filter videos by title",
        }),
        diskid: t.arg.string({
          description: "Filter videos by disk ID",
        }),
        genreName: t.arg.string({
          description: "Filter videos by genre name",
        }),
        mediaType: t.arg.stringList({
          description: "Filter videos by media type",
        }),
        ownerid: t.arg.string({
          description: "Filter videos by owner ID",
        }),
        queryPlot: t.arg.boolean({
          description: "Include plot in the result",
        }),
        queryUserSettings: t.arg.boolean({
          description: "Include user movie settings in the result",
        }),
        userName: t.arg.string({
          description: "user name to filter user movie settings"
        }),
        filterFavorites: t.arg.boolean({
          description: "Filter only for user favorites. Requires user name."
        }),
        filterFlagged: t.arg.boolean({
          description: "Filter only for user favorites. Requires user name."
        }),
        deleteMode: t.arg({
          type: DeleteMode,
          description: "Filter videos based on delete mode",
        }),
        tvSeriesMode: t.arg({
          type: TvSeriesMode,
          description: "Filter videos based on there istv flag"
        }),
        skip: t.arg.int({
          description: "Elements to skip"
        }),
        take: t.arg.int({
          description: "Elements to take"
        })
      },
      resolve: async (parent, args, context) => {
        const query = ""; // You can define your query logic here if needed
        const videosData = await getVideos(args as VideoQueryArgs, query);
        // Map the Prisma results to the GraphQL Video type
        const videos = videosData.videos.map(video => ({
          id: video.id,
          title: video.title,
          subtitle: video.subtitle,
          diskid: video.diskid,
          ownerid: video.owner_id, // Make sure to match the field name
          istv: video.istv == 1 ? true : false,
          plot: args.queryPlot ? video.plot : undefined, // Include plot based on the argument,
          favoriteOf: args.queryUserSettings ? video.userMovieSettings?.filter(s => s.is_favorite).map(s => s.asp_username) : undefined,
          watchAgain: args.queryUserSettings ? video.userMovieSettings?.filter(s => s.watchagain).map(s => s.asp_username) : undefined,
          genres: video.videodb_videogenre?.map(vg => vg.genre.name),
          mediaType: video.videodb_mediatypes?.name,
        }));

        return {
          videos: videos,
          requestMeta: { totalCount: videosData.totalCount },
        };
      }
    })
  })
});

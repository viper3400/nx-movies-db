import { builder } from "../builder";
import {getVideos } from "@nx-movies-db/movies-prisma-lib";
import type { VideoQueryArgs } from "@nx-movies-db/movies-prisma-lib";

export const DeleteMode = builder.enumType("DeleteMode", {
  values: ["ONLY_DELETED", "INCLUDE_DELETED", "EXCLUDE_DELETED"] as const,
  description: "Modes for filtering deleted videos",
});

const RequestMeta = builder.simpleObject("TotalCount", {
  fields: (t) => ({
    totalCount: t.int({
      nullable: false,
    }),
  }),
});

const Video = builder.simpleObject("Video", {
  fields: (t) => ({
    id: t.int(),
    title: t.string(),
    subtitle: t.string(),
    diskid: t.string(),
    ownerid: t.int(),
    plot: t.string(),
    genres: t.stringList(),
    mediaType: t.string()
  })
});

const Videos = builder.simpleObject("Videos", {
  fields: (t) => ({
    requestMeta: t.field({
      type: RequestMeta
    }),
    videos: t.field({
      type: [Video],
      description: "Query to fetch videos based on various filters",
    }),
  })
});

builder.queryType({
  fields: (t) => ({
    videos: t.field({
      type: Videos,
      args: {
        id: t.arg.string({
          description: "Filter videos by id",
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
        deleteMode: t.arg({
          type: DeleteMode,
          description: "Filter videos based on delete mode",
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
          plot: args.queryPlot ? video.plot : undefined, // Include plot based on the argument,
          genres: video.videodb_videogenre?.map( (vg) => vg.genre.name),
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

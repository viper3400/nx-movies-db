import { VideoDbVideoData } from "./videodata";
import { builder } from "../builder";
import { upsertVideoData } from "@nx-movies-db/movies-prisma-lib";
import type { VideoDataInput } from "@nx-movies-db/movies-prisma-lib";

builder.mutationField("upsertVideoData", (t) =>
  t.prismaField({
    type: VideoDbVideoData,
    args: {
      // If `id` is provided, it’ll update; otherwise it creates
      id: t.arg.int(),
      md5: t.arg.string(),
      title: t.arg.string(),
      subtitle: t.arg.string(),
      language: t.arg.string(),
      diskid: t.arg.string(),
      comment: t.arg.string(),
      disklabel: t.arg.string(),
      imdbID: t.arg.string(),
      year: t.arg.int(),
      imgurl: t.arg.string(),
      director: t.arg.string(),
      actors: t.arg.string(),
      runtime: t.arg.int(),
      country: t.arg.string(),
      plot: t.arg.string(),
      rating: t.arg.string(),
      filename: t.arg.string(),
      filesize: t.arg.string(),
      filedate: t.arg.string(),
      audio_codec: t.arg.string(),
      video_codec: t.arg.string(),
      video_width: t.arg.int(),
      video_height: t.arg.int(),
      istv: t.arg.int(),
      lastupdate: t.arg.string(),
      mediatype: t.arg.int(),
      custom1: t.arg.string(),
      custom2: t.arg.string(),
      custom3: t.arg.string(),
      custom4: t.arg.string(),
      created: t.arg.string(),
      owner_id: t.arg.int(),
    },
    resolve: async (_query, _root, args, _ctx) => {
      // Parse ISO-8601 date strings into Date objects
      /*       const filedate = args.filedate ? new Date(Date.parse(args.filedate)) : undefined;
      const lastupdate = args.lastupdate ? new Date(Date.parse(args.lastupdate)) : undefined;
      const created = args.created ? new Date(Date.parse(args.created)) : undefined;
      const filesize = args.filesize ? BigInt(args.filesize) : undefined; */

      const input = {
        ...args,
      } as VideoDataInput;

      return upsertVideoData(input);
    },
  })
);

import { VideoDbVideoData } from "./videodata";
import { builder } from "../builder";
import {
  upsertVideoData,
  getVideoById,
  VideoDataValidationError,
  Prisma,
} from "@nx-movies-db/movies-prisma-lib";
import type { VideoDataInput } from "@nx-movies-db/movies-prisma-lib";
import { GraphQLError } from "graphql";

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
      year: t.arg.int({ required: true }),
      imgurl: t.arg.string(),
      director: t.arg.string(),
      actors: t.arg.string(),
      runtime: t.arg.int(),
      country: t.arg.string(),
      plot: t.arg.string(),
      rating: t.arg.string(),
      filename: t.arg.string(),
      filesize: t.arg({ type: "BigInt" }),
      filedate: t.arg({ type: "DateTime" }),
      audio_codec: t.arg.string(),
      video_codec: t.arg.string(),
      video_width: t.arg.int(),
      video_height: t.arg.int(),
      istv: t.arg.int({ required: true }),
      lastupdate: t.arg({ type: "DateTime" }),
      mediatype: t.arg.int({ required: true }),
      custom1: t.arg.string(),
      custom2: t.arg.string(),
      custom3: t.arg.string(),
      custom4: t.arg.string(),
      created: t.arg({ type: "DateTime" }),
      owner_id: t.arg.int({ required: true }),
      genreIds: t.arg.intList(),
    },
    resolve: async (
      _query,
      _root,
      args,
      _ctx
    ): Promise<Awaited<ReturnType<typeof upsertVideoData>>> => {
      // Parse ISO-8601 date strings into Date objects
      /*       const filedate = args.filedate ? new Date(Date.parse(args.filedate)) : undefined;
      const lastupdate = args.lastupdate ? new Date(Date.parse(args.lastupdate)) : undefined;
      const created = args.created ? new Date(Date.parse(args.created)) : undefined;
      const filesize = args.filesize ? BigInt(args.filesize) : undefined; */

      const input = {
        ...args,
        genreIds: args.genreIds ?? undefined,
      } as VideoDataInput;

      try {
        return await upsertVideoData(input);
      } catch (err) {
        if (err instanceof VideoDataValidationError) {
          throw new GraphQLError("Invalid video data input", {
            extensions: {
              code: "BAD_USER_INPUT",
              issues: err.issues.map(({ path, message }) => ({
                path,
                message,
              })),
            },
          });
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          throw new GraphQLError("Unable to persist video data", {
            extensions: {
              code: "PRISMA_ERROR",
              prismaCode: err.code,
              target: err.meta?.target,
            },
          });
        }
        throw err;
      }
    },
  })
);

builder.queryField("videoData", (t) =>
  t.prismaField({
    type: VideoDbVideoData,
    nullable: true,
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (_query, _root, args) => {
      return getVideoById(args.id);
    },
  })
);

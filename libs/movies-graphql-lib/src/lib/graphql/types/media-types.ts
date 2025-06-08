import { getMediaTypes } from "@nx-movies-db/movies-prisma-lib";
import { builder } from "../builder";

builder.queryField("mediaTypes", (t) =>
  t.prismaField({
    type: ["videodb_mediatypes"],
    args: {
    },
    resolve: async (query, _parent, args, _ctx: any, _info) => {
      return await getMediaTypes();
    },
  }),
);

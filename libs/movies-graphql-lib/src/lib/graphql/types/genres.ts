import { getGenres } from "@nx-movies-db/movies-prisma-lib";
import { builder } from "../builder";

builder.queryField("genres", (t) =>
  t.prismaField({
    type: ["videodb_genres"],
    args: {
    },
    resolve: async (query, _parent, args, _ctx: any, _info) => {
      return await getGenres();
    },
  }),
);

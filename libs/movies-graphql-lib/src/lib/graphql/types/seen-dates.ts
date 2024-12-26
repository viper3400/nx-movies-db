import { builder } from "../builder";
import {getSeenDates, VideoSeenDateArgs } from '@nx-movies-db/movies-prisma-lib';

builder.prismaObject("homewebbridge_userseen", {
  fields: (t: any) => ({
    username: t.exposeString("asp_username"),
    viewdate: t.string({
      resolve: (parent: any) => {
        // Assuming viewdate is a timestamp (number)
        return new Date(parent.viewdate).toISOString();
      },
    }),
  }),
});

builder.queryField("seenData", (t) =>
  t.prismaField({
    type: ["homewebbridge_userseen"],
    args: {
      movieId: t.arg.int(),
      viewGroup: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx: any, _info) => {
      return await getSeenDates( args as VideoSeenDateArgs, query);
    },
  }),
);

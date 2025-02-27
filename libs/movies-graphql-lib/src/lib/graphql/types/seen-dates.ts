import { builder } from "../builder";
import { createUserSeenEntry, deleteUserSeenEntry, getSeenDates, VideoSeenDateArgs } from "@nx-movies-db/movies-prisma-lib";

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
      return await getSeenDates(args as VideoSeenDateArgs, query);
    },
  }),
);

builder.mutationField("createUserSeenEntry", (t) =>
  t.prismaField({
    type: "homewebbridge_userseen",
    args: {
      movieId: t.arg.int({ required: true }),
      viewGroup: t.arg.string({ required: true }),
      viewDate: t.arg.string({ required: true }),
      userName: t.arg.string({ required: true })
    },
    resolve: async (query, root, args, ctx) => {
      const date = Date.parse(args.viewDate);
      const result = await createUserSeenEntry({
        movieId: args.movieId,
        viewGroup: args.viewGroup,
        viewDate: new Date(date),
        userName: args.userName
      });
      return result;
    },
  })
);

builder.mutationField("deleteUserSeenEntry", (t) =>
  t.prismaField({
    type: "homewebbridge_userseen",
    args: {
      movieId: t.arg.int({ required: true }),
      viewGroup: t.arg.string({ required: true }),
      viewDate: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      const date = Date.parse(args.viewDate);
      await deleteUserSeenEntry({
        movieId: args.movieId,
        viewGroup: args.viewGroup,
        viewDate: new Date(date),
      });
      return null;
    },
  })
);

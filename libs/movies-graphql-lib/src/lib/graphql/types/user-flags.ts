import { builder } from "../builder";
import { createOrUpdateUserFlag, getUserFlagsForUser, UserFlagsForMovieArgs } from "@nx-movies-db/movies-prisma-lib";

builder.prismaObject("homewebbridge_usermoviesettings", {
  fields: (t: any) => ({
    movieId: t.exposeInt("vdb_movieid"),
    isWatchAgain: t.exposeBoolean("watchagain"),
    isFavorite: t.exposeBoolean("is_favorite"),
    userName: t.exposeString("asp_username")
  }),
});

builder.queryField("userFlagsForUser", (t) =>
  t.prismaField({
    type: ["homewebbridge_usermoviesettings"],
    args: {
      movieId: t.arg.int(),
      userName: t.arg.string(),
    },
    resolve: async (query, _parent, args, _ctx: any, _info) => {
      return await getUserFlagsForUser( args as UserFlagsForMovieArgs, query);
    },
  }),
);

/* GraphQL Mutation example
mutation {
  createOrUpdateUserFlag(
    isFavorite: false,
    isWatchAgain: false,
    movieId: 101,
    userName: "Klaus")
  {movieId}
  }
*/

builder.mutationField("createOrUpdateUserFlag", (t) =>
  t.prismaField({
    type: "homewebbridge_usermoviesettings",
    args: {
      movieId: t.arg.int({ required: true }),
      isWatchAgain: t.arg.boolean({ required: true }),
      isFavorite: t.arg.boolean({ required: true }),
      userName: t.arg.string({ required: true }),
    },
    resolve: async (query, root, args, ctx) => {
      const result = await createOrUpdateUserFlag(args);
      return result;
    },
  })
);

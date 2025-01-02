import { builder } from "../builder";
import { getUserFlagsForUser, UserFlagsForMovieArgs } from "@nx-movies-db/movies-prisma-lib";

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

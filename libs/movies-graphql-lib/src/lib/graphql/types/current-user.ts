import { getUserByEmail } from "@nx-movies-db/movies-prisma-lib";
import { builder } from "../builder";
import { CurrentUser } from "../objects";

type JwtContext = {
  jwt?: {
    payload?: {
      email?: unknown;
    };
  };
};

builder.queryField("currentUser", (t) =>
  t.field({
    type: CurrentUser,
    nullable: true,
    resolve: async (_parent, _args, context: JwtContext) => {
      const email = context.jwt?.payload?.email;
      if (typeof email !== "string" || !email) return null;

      const user = await getUserByEmail(email);
      if (!user) return null;

      return user;
    },
  })
);

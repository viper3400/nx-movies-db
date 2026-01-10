import { builder } from "../builder";
import { prisma } from "@nx-movies-db/movies-prisma-lib";

builder.queryField("owners", (t) =>
  t.prismaField({
    type: ["videodb_users"],
    resolve: async (query) => {
      return prisma.videodb_users.findMany({
        ...query,
        orderBy: { name: "asc" },
      });
    },
  })
);

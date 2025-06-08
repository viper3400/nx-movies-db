import { builder } from "../builder";

builder.prismaObject("videodb_genres", {
  fields: (t: any) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name")
  }),
});

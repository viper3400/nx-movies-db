import { builder } from "../builder";

builder.prismaObject("videodb_mediatypes", {
  fields: (t: any) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name")
  }),
});

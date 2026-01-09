import { builder } from "../builder";

builder.prismaObject("videodb_users", {
  fields: (t: any) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email", { nullable: true }),
  }),
});

import { builder } from "../builder";

export const CurrentUser = builder.simpleObject("CurrentUser", {
  fields: (t) => ({
    id: t.int(),
    name: t.string(),
    email: t.string({ nullable: true }),
  }),
});

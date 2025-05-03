import { builder } from "../builder";

export const RequestMeta = builder.simpleObject("TotalCount", {
  fields: (t) => ({
    totalCount: t.int({
      nullable: false,
    }),
  }),
});

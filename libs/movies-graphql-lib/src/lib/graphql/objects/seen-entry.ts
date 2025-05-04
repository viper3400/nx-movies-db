import { builder } from "../builder";

export const SeenEntry = builder.simpleObject("SeenEntry", {
  fields: (t) => ({
    viewDate: t.string(),
    userName: t.string(),
    movieId: t.int()
  })
});

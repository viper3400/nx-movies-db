import { builder } from "../builder";
import { Video } from ".";

export const SeenEntry = builder.simpleObject("SeenEntry", {
  fields: (t) => ({
    viewDate: t.string(),
    userName: t.string(),
    movieId: t.int(),
    video: t.field({ type: Video })
  })
});

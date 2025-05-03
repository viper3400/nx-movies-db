import { builder } from "../builder";

export const Video = builder.simpleObject("Video", {
  fields: (t) => ({
    id: t.int(),
    title: t.string(),
    subtitle: t.string(),
    diskid: t.string(),
    ownerid: t.int(),
    istv: t.boolean(),
    plot: t.string(),
    favoriteOf: t.stringList(),
    genres: t.stringList(),
    mediaType: t.string()
  })
});

import { builder } from "../builder";

export const Video = builder.simpleObject("Video", {
  fields: (t) => ({
    id: t.int(),
    title: t.string(),
    subtitle: t.string(),
    diskid: t.string(),
    filename: t.string({ nullable: true }),
    ownerid: t.int(),
    istv: t.boolean(),
    plot: t.string(),
    favoriteOf: t.stringList(),
    genres: t.stringList(),
    mediaType: t.string(),
    rating: t.string(),
    runtime: t.int()
  })
});

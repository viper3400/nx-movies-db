import { builder } from "../builder";

builder.prismaObject("videodb_videogenre", {
  fields: (t: any) => ({
    video_id: t.exposeInt("video_id"),
    genre_id: t.exposeInt("genre_id"),
    genre: t.relation("genre"),
  }),
});

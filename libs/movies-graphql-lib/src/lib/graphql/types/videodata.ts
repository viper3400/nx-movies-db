import { builder } from "../builder";



export const VideoDbVideoData = builder.prismaObject("videodb_videodata", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    md5: t.exposeString("md5", { nullable: true }),
    title: t.exposeString("title", { nullable: true }),
    subtitle: t.exposeString("subtitle", { nullable: true }),
    language: t.exposeString("language", { nullable: true }),
    diskid: t.exposeString("diskid", { nullable: true }),
    comment: t.exposeString("comment", { nullable: true }),
    disklabel: t.exposeString("disklabel", { nullable: true }),
    imdbID: t.exposeString("imdbID", { nullable: true }),
    year: t.exposeInt("year"),
    imgurl: t.exposeString("imgurl", { nullable: true }),
    director: t.exposeString("director", { nullable: true }),
    actors: t.exposeString("actors", { nullable: true }),
    runtime: t.exposeInt("runtime", { nullable: true }),
    country: t.exposeString("country", { nullable: true }),
    plot: t.exposeString("plot", { nullable: true }),
    rating: t.exposeString("rating", { nullable: true }),
    filename: t.exposeString("filename", { nullable: true }),
    filesize: t.field({
      type: "BigInt",
      nullable: true,
      resolve: p => p.filesize
    }),
    filedate: t.field({
      type: "DateTime",
      nullable: true,
      resolve: p => p.filedate,
    }),
    audio_codec: t.exposeString("audio_codec", { nullable: true }),
    video_codec: t.exposeString("video_codec", { nullable: true }),
    video_width: t.exposeInt("video_width", { nullable: true }),
    video_height: t.exposeInt("video_height", { nullable: true }),
    istv: t.exposeInt("istv"),
    lastupdate: t.field({
      type: "DateTime",
      resolve: p => p.lastupdate,
    }),
    mediatype: t.exposeInt("mediatype"),
    custom1: t.exposeString("custom1", { nullable: true }),
    custom2: t.exposeString("custom2", { nullable: true }),
    custom3: t.exposeString("custom3", { nullable: true }),
    custom4: t.exposeString("custom4", { nullable: true }),
    created: t.field({
      type: "DateTime",
      nullable: true,
      resolve: p => p.created,
    }),
    owner_id: t.exposeInt("owner_id"),
  }),
});

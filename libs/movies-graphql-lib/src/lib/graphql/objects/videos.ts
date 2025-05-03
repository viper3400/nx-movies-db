import { builder } from "../builder";
import { RequestMeta, Video } from ".";

export const Videos = builder.simpleObject("Videos", {
  fields: (t) => ({
    requestMeta: t.field({
      type: RequestMeta
    }),
    videos: t.field({
      type: [Video],
      description: "Query to fetch videos based on various filters",
    }),
  })
});

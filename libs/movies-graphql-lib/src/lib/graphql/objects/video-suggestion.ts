import { builder } from "../builder";

export const VideoSuggestion = builder.simpleObject("VideoSuggestion", {
  fields: (t) => ({
    id: t.int(),
    title: t.string({ nullable: true }),
    subtitle: t.string({ nullable: true }),
    diskid: t.string({ nullable: true }),
  }),
});

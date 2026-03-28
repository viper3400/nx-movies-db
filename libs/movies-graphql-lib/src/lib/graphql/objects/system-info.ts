import { builder } from "../builder";

export const SystemInfo = builder.simpleObject("SystemInfo", {
  description: "Metadata about the running movies service build.",
  fields: (t) => ({
    appVersion: t.string({
      description: "Semantic version of the deployed workspace.",
    }),
  }),
});

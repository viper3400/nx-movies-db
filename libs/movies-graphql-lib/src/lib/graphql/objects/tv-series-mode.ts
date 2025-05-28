import { builder } from "../builder";

export const TvSeriesMode = builder.enumType("TvSeriesMode", {
  values: ["ONLY_TVSERIES", "INCLUDE_TVSERIES", "EXCLUDE_TVSERIES"] as const,
  description: "Modes for filtering tv series",
});

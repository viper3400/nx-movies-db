import { builder } from "../builder";

export const DeleteMode = builder.enumType("DeleteMode", {
  values: ["ONLY_DELETED", "INCLUDE_DELETED", "EXCLUDE_DELETED"] as const,
  description: "Modes for filtering deleted videos",
});

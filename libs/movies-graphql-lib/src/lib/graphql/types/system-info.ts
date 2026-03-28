import { builder } from "../builder";
import { SystemInfo } from "../objects";
import { getVersionMetadata } from "../../version-metadata";

builder.queryFields((t) => ({
  systemInfo: t.field({
    type: SystemInfo,
    description: "Version metadata for the movies service deployment.",
    resolve: () => getVersionMetadata(),
  }),
}));

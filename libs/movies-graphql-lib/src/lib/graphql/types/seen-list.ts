import { getSeenList, GetSeenListArgs } from "@nx-movies-db/movies-prisma-lib";
import { builder } from "../builder";
import { RequestMeta, SeenEntry } from "../objects";

const SeenEntries = builder.simpleObject("SeenEntries", {
  fields: (t) => ({
    requestMeta: t.field({
      type: RequestMeta
    }),
    SeenEntries: t.field({
      type: [SeenEntry],
      description: "Query to fetch seen entries",
    }),
  })
});

builder.queryType({
  fields: (t) => ({
    seenVideos: t.field({
      type: SeenEntries,
      args: {
        viewGroup: t.arg.string(),
        fromDate: t.arg.string(),
        toDate: t.arg.string(),
        skip: t.arg.int({
          description: "Elements to skip"
        }),
        take: t.arg.int({
          description: "Elements to take"
        })
      },
      resolve: async (_parent, args, _ctx: any) => {
        const seenData = await getSeenList(args as GetSeenListArgs, null);

        const mappedSeenData = seenData.map((entry: any) => ({
          viewDate: entry.viewdate.toISOString(),
          userName: entry.asp_username,
          movieId: entry.vdb_videoid,
        }));

        const count = mappedSeenData.length;

        return {
          requestMeta: {
            totalCount: count,
          },
          SeenEntries: mappedSeenData,
        };
      },
    })
  }
  )
});

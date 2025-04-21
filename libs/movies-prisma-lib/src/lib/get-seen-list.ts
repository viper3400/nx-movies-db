import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type GetSeenListArgs = {
  fromDate?: Date;
  toDate?: Date;
  viewGroup: string;
  skip?: number;
  take?: number;
}
export const getSeenList = async (args: GetSeenListArgs, query: any) => {
  const { fromDate, toDate, viewGroup, take, skip } = args;

  const where: any = {
    asp_viewgroup: viewGroup
  };

  if (fromDate) {
    where.viewdate = {
      gte: fromDate
    };
  }

  if (toDate) {
    where.viewdate = {
      ...where.viewdate,
      lte: toDate
    };
  }

  return await prisma.homewebbridge_userseen.findMany({
    where,
    select: {
      asp_username: true,
      viewdate: true,
      vdb_videoid: true
    },
    orderBy: {
      viewdate: "desc",
    },
    take: take,
    skip: skip,
    ...query,
  });
};


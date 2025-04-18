import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type GetSeenListArgs = {
  fromDate?: Date;
  toDate?: Date;
  viewGroup: string;
}
export const getSeenList = async (args: GetSeenListArgs, query: any) => {
  const { fromDate, toDate, viewGroup } = args;

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
      id: true
    },
    orderBy: {
      viewdate: "desc",
    },
    ...query,
  });
};


import { prisma } from "@nx-movies-db/movies-prisma-lib";

async function main() {
  // ... you will write your Prisma Client queries here
}
export const initConnection = () =>
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });

async function test() {
  const diskid = undefined;
  const title = "Gras";
  const genreName = "Drama";

  return await prisma.videodb_videodata.findMany({
    where: {
      AND: [
        {
          OR: [
            { title: title ? { contains: title } : undefined }, // Apply title filter if provided
            { subtitle: title ? { contains: title } : undefined }, // Apply subtitle filter if provided
          ],
        },
        { diskid: diskid ? { startsWith: diskid } : undefined }, // Apply diskid filter if provided
        {
          videodb_videogenre: {
            some: {
              genre: {
                name: genreName ? { contains: genreName } : undefined, // Filter by genre name if provided
              },
            },
          },
        },
      ],
    },
    include: {
      videodb_videogenre: {
        select: {
          genre: {
            select: {
              name: true, // Select genre name
            },
          },
        },
      },
      videodb_mediatypes: {
        select: {
          name: true,
        },
      },
    },
  });
}

import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import type PrismaTypes from "@pothos/plugin-prisma/generated";
import { prisma } from "@nx-movies-db/movies-prisma-lib";
import { DateTimeResolver, BigIntResolver } from "graphql-scalars";
import { GraphQLScalarType } from "graphql";

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Scalars: {
    /** maps your GraphQL input (string) to JS Date, and JS Date back to GraphQL */
    DateTime: { Input: Date | string; Output: Date };
    /** maps GraphQL inputs (string|number) to JS bigint, and bigint back out */
    BigInt: { Input: string | number | bigint; Output: bigint };
  };
}>({
  plugins: [PrismaPlugin, SimpleObjectsPlugin],
  prisma: {
    client: prisma,
  },
});
builder.addScalarType(
  "DateTime",
  new GraphQLScalarType({
    name: "DateTime",
    description: "An ISO-8601 encoded UTC date string",
    serialize: DateTimeResolver.serialize,
    parseValue: DateTimeResolver.parseValue,
    parseLiteral: DateTimeResolver.parseLiteral,
  }),
  {
    // Tell Pothos that at runtime our resolvers use `Date` values
    //parseValue: (value) => value,
    //serialize: (value) => value,
  }
);

builder.addScalarType(
  "BigInt",
  new GraphQLScalarType({
    name: "BigInt",
    description: "Arbitrary-precision integer",
    serialize: BigIntResolver.serialize,
    parseValue: BigIntResolver.parseValue,
    parseLiteral: BigIntResolver.parseLiteral,
  }),
  {
    // At runtime we deal in JS `bigint`
    //parseValue: (value) => BigInt(value as string),
    //serialize: (value) => value,
  }
);


builder.mutationType({});

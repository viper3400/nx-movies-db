import { PrismaClient } from "./generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: parseInt(process.env.DATABASE_PORT || "3306", 10),
  allowPublicKeyRetrieval: true
};

if (!connectionConfig.host) {
  throw new Error("DATABASE_HOST is not defined – Prisma client cannot start.");
}

const adapter = new PrismaMariaDb(connectionConfig, {
  database: connectionConfig.database,
  onConnectionError: (err) => {
    console.error("[PRISMA CLIENT] Connection error", err);
  }
});

export const prisma = new PrismaClient({ adapter });

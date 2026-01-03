// libs/movies-prisma-lib/jest.setup.ts
import * as dotenv from "dotenv";
import { beforeAll, afterAll } from "@jest/globals";
import * as net from "node:net";
import * as mariadb from "mariadb";
import { prisma } from "./src/prismaclient";

dotenv.config({
  path: !process.env.CI && process.env.NODE_ENV !== "production"
    ? ".env.local"
    : ".env",
});

console.log("[JEST ENV]", {
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_USER: process.env.DATABASE_USER
});

const databaseHost = process.env.DATABASE_HOST ?? "127.0.0.1";
const databasePort = parseInt(process.env.DATABASE_PORT ?? "3306", 10);

const tcpProbe = () =>
  new Promise<void>((resolve, reject) => {
    const socket = net.createConnection({ host: databaseHost, port: databasePort });
    socket.setTimeout(5000);
    socket.once("connect", () => {
      console.log("[JEST ENV] TCP probe connected to DB port.");
      socket.end();
      resolve();
    });
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("TCP probe timed out"));
    });
    socket.once("error", (err) => {
      reject(err);
    });
  });

const mariadbProbe = async () => {
  const connection = await mariadb.createConnection({
    host: databaseHost,
    port: databasePort,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectTimeout: 5000
  });
  try {
    await connection.query("SELECT 1 as ping");
    console.log("[JEST ENV] MariaDB driver probe succeeded.");
  } finally {
    await connection.end();
  }
};

beforeAll(async () => {
  console.log("[JEST ENV] Probing database connectivity...");
  try {
    await tcpProbe();
  } catch (err) {
    console.error("[JEST ENV] TCP probe failed:", err);
    throw err;
  }

  try {
    await mariadbProbe();
  } catch (err) {
    console.error("[JEST ENV] MariaDB probe failed:", err);
    throw err;
  }

  console.log("[JEST ENV] Connecting to Prisma database client...");
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  console.log("[JEST ENV] Database connection established.");
});

afterAll(async () => {
  await prisma.$disconnect();
});

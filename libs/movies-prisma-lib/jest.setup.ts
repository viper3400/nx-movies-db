// libs/movies-prisma-lib/jest.setup.ts
import * as dotenv from "dotenv";

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

import express, { Request, Response, NextFunction } from "express";
import accessEnv from "./helpers/access-env";
import cors from "cors";
import bodyParser from "body-parser";
import { yoga } from "@nx-movies-db/movies-graphql-lib";


const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
const PORT = parseInt(accessEnv("PORT", "7100"), 10);

console.log({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  pass: process.env.DATABASE_PASSWORD ? "SET" : "EMPTY",
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME
});

app.use(bodyParser.json());

app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
  }),
);

//setupRoutes(app)

app.use(yoga.graphqlEndpoint, yoga);

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Users service listening at port ${PORT}`);
});

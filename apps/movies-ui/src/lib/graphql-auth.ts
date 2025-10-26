import * as jwt from "jsonwebtoken";
import { StringValue } from "ms";

export async function signApiToken({ sub, email, name, expiresIn = "15Mins" }:
  { sub: string | undefined, email: string | undefined, name: string | undefined, expiresIn?: StringValue | number }) {

  console.log("Create a short-lived API token (Bearer) for GraphQL")
  // Create a short-lived API token (Bearer) for GraphQL
  const token = jwt.sign(
    {
      sub: sub || "unknown",
      email: email || undefined,
      name: name || undefined,
      // add roles/claims here if you need them
    },
    process.env.JWT_SECRET!, // same secret your Yoga server verifies with
    { algorithm: "HS256", expiresIn: expiresIn, issuer: "movie-database" }
  );

  return token;
}

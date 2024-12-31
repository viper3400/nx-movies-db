import { createYoga } from "graphql-yoga";
import { createInlineSigningKeyProvider, useJWT } from "@graphql-yoga/plugin-jwt";
import { schema } from "./graphql/schema";

export const yoga = createYoga({
  schema,
  plugins: [
    useJWT({
      singingKeyProviders: [createInlineSigningKeyProvider(process.env.JWT_SECRET as string)],
      tokenVerification: {
        issuer: ["Online JWT Builder"],
        algorithms: ["HS256"]
      },
      reject: {
        missingToken: true,
        invalidToken: true,
      }
    })
  ] });


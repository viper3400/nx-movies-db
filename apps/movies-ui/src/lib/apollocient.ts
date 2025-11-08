import { InMemoryCache, ApolloClient, createHttpLink } from "@apollo/client";
import { registerApolloClient } from "@apollo/client-integration-nextjs";
import { headers } from "next/headers";

// Point the client to your Next.js server-side proxy. This route should:
// 1) check the NextAuth session,
// 2) mint a short-lived API JWT, and
// 3) forward to the Yoga GraphQL server with Authorization: Bearer <token>.
// Optionally allow override via env in case you deploy the proxy elsewhere.
const graphqlProxyUrl = process.env.NEXT_PUBLIC_GRAPHQL_PROXY_URL ?? "/api/graphql-proxy";

const httpLink = createHttpLink({
  uri: graphqlProxyUrl,
  // Browser: let fetch include cookies automatically for same-origin
  credentials: "same-origin",
  // Server: forward the incoming request's cookies so auth() in the proxy can read the session
  fetch: async (uri, options) => {
    if (typeof window === "undefined") {
      const h = await headers();
      const cookie = h.get("cookie") ?? "";
      return fetch(uri, {
        ...options,
        headers: {
          ...(options?.headers || {}),
          cookie,
        },
      });
    }
    return fetch(uri, options as any);
  },
});

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
  });
});

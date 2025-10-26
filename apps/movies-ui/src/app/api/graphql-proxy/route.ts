// app/api/graphql-proxy/route.ts
import { signApiToken } from "../../../lib/graphql-auth";
import { getAllowedSession } from "../../services/actions/getAllowedSession";


const GRAPHQL_URL = process.env.GRAPHQL_URL!; // Yoga server endpoint

export async function POST(req: Request) {
  console.log("Graphql Proxy called")
  const session = await getAllowedSession();
  if (!session?.eMail) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Mint a short-lived API token
  const apiToken = await signApiToken({
    sub: session.ownerId.toString(), // ensure your NextAuth token includes id
    email: session.eMail ?? undefined,
    name: session.userName as string,
  });

  // Forward the GraphQL body & headers
  const body = await req.text(); // raw body
  const upstream = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiToken}`,
    },
    body,
  });

  // Stream response back to the client
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}

export async function GET(_req: Request) {
  const session = await getAllowedSession();
  if (!session?.eMail) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiToken = await signApiToken({
    sub: session.ownerId.toString(),
    email: session.eMail ?? undefined,
    name: session.userName as string,
    expiresIn: "12H"
  });

  // Optional: include a hint about expiry if your signer encodes exp; otherwise omit
  return new Response(
    JSON.stringify({ token: apiToken, type: "Bearer", expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toLocaleString() }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      },
    }
  );
}

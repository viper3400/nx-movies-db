import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const githubId = process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET;

if (!githubId || !githubSecret) {
  throw new Error("GITHUB_ID and GITHUB_SECRET must be set in the environment variables.");
}

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: githubId,
      clientSecret: githubSecret,
    }),
  ],
  pages: {
    error: '/auth/error', // Error code passed in query string as ?error=
  },
});

// Export the handler for both GET and POST requests
export { handler as GET, handler as POST };

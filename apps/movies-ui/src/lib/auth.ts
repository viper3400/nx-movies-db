import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from 'next-auth/providers/credentials';


const githubId = process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;


if (!githubId || !githubSecret) {
  throw new Error("GITHUB_ID and GITHUB_SECRET must be set in the environment variables.");
}

if (!googleClientId || !googleClientSecret) {
  throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in the environment variables.");
}

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const config = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    GithubProvider({
      clientId: githubId,
      clientSecret: githubSecret
    }),
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret
    }),
  ],
  // rest of your config
} satisfies NextAuthOptions;

// Use it in server contexts
export function auth(...args: [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']] | [NextApiRequest, NextApiResponse] | []) {
  return getServerSession(...args, config);
}

import type { NextAuthOptions, User } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0",
      authorization: {
        params: {
          scope: "tweet.read users.read offline.access like.read list.read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        const acc = account as unknown as { access_token?: string };
        if (acc.access_token) {
          (token as unknown as { access_token?: string }).access_token = acc.access_token;
        }
      }
      if (profile) {
        const p = profile as Record<string, unknown>;
        const username = (p["username"] as string) || (p["screen_name"] as string) || null;
        if (username) (token as Record<string, unknown>)["username"] = username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as User & { username?: string }).username = (token as Record<string, unknown>)["username"] as string | undefined;
      }
      (session as unknown as { access_token?: string }).access_token = (token as unknown as { access_token?: string }).access_token;
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};



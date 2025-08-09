import type { NextAuthOptions, User } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "1.0A",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const p = profile as Record<string, unknown>;
        const username = (p["screen_name"] as string) || (p["username"] as string) || null;
        if (username) (token as Record<string, unknown>)["username"] = username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as User & { username?: string }).username = (token as Record<string, unknown>)["username"] as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};



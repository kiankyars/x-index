import type { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { env } from "@/env";

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: env.X_CLIENT_ID || "",
      clientSecret: env.X_CLIENT_SECRET || "",
      version: "2.0",
      authorization: {
        params: {
          scope: "tweet.read users.read offline.access like.read list.read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      const acc = account as (typeof account & { access_token?: string }) | null;
      if (acc && acc.access_token) {
        (token as unknown as { access_token?: string }).access_token = acc.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as unknown as { access_token?: string }).access_token = (token as unknown as { access_token?: string }).access_token;
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: env.NEXTAUTH_SECRET,
};



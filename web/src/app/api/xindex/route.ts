import { NextRequest, NextResponse } from "next/server";
import { computeHIndex, fetchRecentTweets } from "@/lib/x";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/options";
import { TwitterApi } from "twitter-api-v2";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as unknown as { access_token?: string }).access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const limit = Number(searchParams.get("limit") ?? 200);

  const token = (session as unknown as { access_token: string }).access_token;
  const client = new TwitterApi(token).readOnly;
  let userId: string;
  if (username) {
    const user = await client.v2.userByUsername(username);
    userId = user.data.id;
  } else {
    const me = await client.v2.me();
    userId = me.data.id;
  }

  const tweets = await fetchRecentTweets(token, userId, limit);
  const h = computeHIndex(tweets);
  return NextResponse.json({ h, count: tweets.length });
}



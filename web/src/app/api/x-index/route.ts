import { NextRequest } from "next/server";
import { computeXIndexForWindow, type XIndexWindow } from "@/lib/xIndex";
import { fetchRecentTweets } from "@/lib/xClient";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const windowParam = (searchParams.get("window") as XIndexWindow) || "all";
  const maxCountParam = searchParams.get("limit");

  if (!username) {
    return Response.json({ error: "username is required" }, { status: 400 });
  }

  try {
    const bearerToken = process.env.X_BEARER_TOKEN ?? "";
    let tweets;
    if (bearerToken) {
      tweets = await fetchRecentTweets({ username, bearerToken, maxCount: maxCountParam ? Number(maxCountParam) : 200 });
    } else {
      // Fallback mock for local dev without token
      const now = new Date();
      tweets = Array.from({ length: 50 }).map((_, i) => ({
        id: String(i + 1),
        text: `Mock tweet ${i + 1}`,
        createdAt: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
        likeCount: Math.floor(Math.random() * 50),
        retweetCount: Math.floor(Math.random() * 30),
        url: `https://x.com/${username}/status/${i + 1}`,
      }));
    }

    const result = computeXIndexForWindow(tweets, windowParam);
    return Response.json({ username, window: windowParam, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}



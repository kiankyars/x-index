import { NextRequest } from "next/server";
import { computeXIndexForWindow, type XIndexWindow } from "@/lib/xIndex";
import { fetchRecentTweets, getUserByUsername } from "@/lib/xClient";
import { getSupabaseAdmin } from "@/lib/supabase";

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

    // Persist best-effort to Supabase if configured
    try {
      const supabase = getSupabaseAdmin();
      const profile = bearerToken ? await getUserByUsername(username, bearerToken) : { name: username, username, profileImageUrl: undefined };
      const { error } = await supabase.from("scores").upsert(
        {
          username: profile.username,
          name: profile.name,
          avatar_url: profile.profileImageUrl ?? null,
          h_index: result.hIndex,
          window: windowParam,
          computed_at: new Date().toISOString(),
        },
        { onConflict: "username,window" }
      );
      if (error) console.error("Supabase upsert error", error);
    } catch (e) {
      // ignore if supabase not configured
    }

    return Response.json({ username, window: windowParam, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}



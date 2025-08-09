import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { computeXIndexForWindow } from "@/lib/xIndex";
import { fetchRecentTweets } from "@/lib/xClient";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest) {
  const bearerToken = process.env.X_BEARER_TOKEN ?? "";
  if (!bearerToken) {
    return Response.json({ error: "Server not configured with X_BEARER_TOKEN" }, { status: 500 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const { data: users, error } = await supabase
      .from("scores")
      .select("username")
      .neq("username", "")
      .limit(2000);
    if (error) throw error;
    const uniqueUsernames = Array.from(
      new Set((users || []).map((u: { username: string }) => u.username))
    );

    for (const username of uniqueUsernames) {
      const tweets = await fetchRecentTweets({ username, bearerToken });
      for (const windowVal of ["all", "30d", "90d"] as const) {
        const result = computeXIndexForWindow(tweets, windowVal);
        const { error: upErr } = await supabase.from("scores").upsert({
          username,
          name: username,
          avatar_url: null,
          h_index_likes: result.hIndexLikes,
          h_index_retweets: result.hIndexRetweets,
          time_window: windowVal,
          computed_at: new Date().toISOString(),
        }, { onConflict: "username,time_window" });
        if (upErr) console.error("Recompute upsert error", upErr.message);
      }
    }
    return Response.json({ ok: true, users: uniqueUsernames.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}



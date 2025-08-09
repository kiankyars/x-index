import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const windowParam = searchParams.get("window") ?? "all";
  const limit = Number(searchParams.get("limit") ?? 50);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("scores")
      .select("username, name, avatar_url, h_index, h_index_likes, h_index_retweets, time_window, computed_at")
      .eq("time_window", windowParam)
      .order("h_index_likes", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Response.json({ window: windowParam, results: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}



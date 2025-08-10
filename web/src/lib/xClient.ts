import { type Tweet } from "@/lib/xIndex";

export type FetchTweetsParams = {
  username: string;
  maxCount?: number; // best-effort
  bearerToken: string;
};

export type XUser = {
  id: string;
  name: string;
  username: string;
  profileImageUrl?: string;
};

export async function getUserByUsername(username: string, bearerToken: string): Promise<XUser> {
  if (!bearerToken) throw new Error("Missing X API bearer token");
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=profile_image_url,name,username`,
    { headers: { Authorization: `Bearer ${bearerToken}` }, cache: "no-store" }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to resolve user: ${res.status} ${text}`);
  }
  const json = await res.json();
  const d = json?.data;
  if (!d?.id) throw new Error("User not found");
  return {
    id: d.id,
    name: d.name,
    username: d.username,
    profileImageUrl: d.profile_image_url,
  };
}

// Minimal X API v2 client using recent tweets from a user.
// Requires Elevated/Basic tier for user tweets endpoint.
// If token is missing/unavailable, caller should fall back to mock.
export async function fetchRecentTweets({ username, maxCount = 200, bearerToken }: FetchTweetsParams): Promise<Tweet[]> {
  if (!bearerToken) throw new Error("Missing X API bearer token");

  // 1) Resolve user id by username
  const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}`, {
    headers: { Authorization: `Bearer ${bearerToken}` },
    cache: "no-store",
  });
  if (!userRes.ok) {
    const text = await userRes.text();
    throw new Error(`Failed to resolve user: ${userRes.status} ${text}`);
  }
  const userJson = await userRes.json();
  const userId = userJson?.data?.id as string | undefined;
  if (!userId) throw new Error("User not found");

  // 2) Fetch tweets with public metrics
  // Note: API has pagination. We'll fetch first page only for MVP.
  const tweetsRes = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?max_results=${Math.min(100, maxCount)}&tweet.fields=public_metrics,created_at&exclude=retweets`,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      cache: "no-store",
    }
  );
  if (!tweetsRes.ok) {
    const text = await tweetsRes.text();
    throw new Error(`Failed to fetch tweets: ${tweetsRes.status} ${text}`);
  }
  const tweetsJson = await tweetsRes.json();
  const tweets = (tweetsJson?.data ?? []) as Array<{
    id: string;
    text: string;
    created_at: string;
    public_metrics?: { like_count?: number; retweet_count?: number };
  }>;

  return tweets.map((t) => ({
    id: t.id,
    text: t.text,
    createdAt: t.created_at,
    likeCount: t.public_metrics?.like_count ?? 0,
    retweetCount: t.public_metrics?.retweet_count ?? 0,
    url: `https://x.com/${encodeURIComponent(username)}/status/${t.id}`,
  }));
}



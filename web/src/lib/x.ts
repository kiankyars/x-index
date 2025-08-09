import { TwitterApi } from "twitter-api-v2";

export type TweetLite = {
  id: string;
  like_count: number;
  retweet_count: number;
  created_at?: string;
};

export async function fetchRecentTweets(
  bearerToken: string,
  userId: string,
  maxResults: number = 200
): Promise<TweetLite[]> {
  const client = new TwitterApi(bearerToken);
  const ro = client.readOnly;

  // v2 user tweets with public metrics
  const tweets = await ro.v2.userTimeline(userId, {
    "tweet.fields": ["public_metrics", "created_at"],
    max_results: Math.min(100, Math.max(5, maxResults)),
    exclude: ["replies"],
  });

  const result: TweetLite[] = [];
  for await (const t of tweets) {
    const m = t.public_metrics!;
    result.push({
      id: t.id,
      like_count: m.like_count ?? 0,
      retweet_count: m.retweet_count ?? 0,
      created_at: t.created_at ?? undefined,
    });
    if (result.length >= maxResults) break;
  }

  return result;
}

export function computeHIndex(tweets: TweetLite[]): number {
  const scores = tweets
    .map((t) => (t.like_count || 0) + (t.retweet_count || 0))
    .sort((a, b) => b - a);
  let h = 0;
  for (let i = 0; i < scores.length; i++) {
    const threshold = i + 1;
    if (scores[i] >= threshold) h = threshold;
    else break;
  }
  return h;
}



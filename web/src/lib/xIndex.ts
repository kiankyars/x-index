export type Tweet = {
  id: string;
  text: string;
  createdAt: string; // ISO date
  likeCount: number;
  retweetCount: number;
  url?: string;
};

export type XIndexWindow = "all" | "30d" | "90d";

export type XIndexResult = {
  hIndexLikes: number;
  hIndexRetweets: number;
  countedTweetIds: string[];
  topTweets: Tweet[]; // tweets that count toward likes H, sorted by likes desc
  engagementsSorted: number[]; // total engagements sorted desc (for chart)
};

function parseWindowToSinceDate(window: XIndexWindow, now = new Date()): Date | null {
  if (window === "all") return null;
  const since = new Date(now);
  if (window === "30d") since.setDate(since.getDate() - 30);
  if (window === "90d") since.setDate(since.getDate() - 90);
  return since;
}

export function filterTweetsByWindow(tweets: Tweet[], window: XIndexWindow, now = new Date()): Tweet[] {
  const since = parseWindowToSinceDate(window, now);
  if (!since) return tweets;
  return tweets.filter((t) => new Date(t.createdAt) >= since);
}

export function computeXIndex(tweets: Tweet[]): XIndexResult {
  const withEngagement = tweets.map((t) => ({
    tweet: t,
    engagement: (t.likeCount || 0) + (t.retweetCount || 0),
  }));
  withEngagement.sort((a, b) => b.engagement - a.engagement);

  // Likes-only H-index
  const likesSorted = [...tweets]
    .map((t) => ({ tweet: t, val: t.likeCount || 0 }))
    .sort((a, b) => b.val - a.val);
  let hLikes = 0;
  for (let i = 0; i < likesSorted.length; i += 1) {
    const rank = i + 1;
    if (likesSorted[i].val >= rank) hLikes = rank; else break;
  }

  // Retweets-only H-index
  const rtsSorted = [...tweets]
    .map((t) => ({ tweet: t, val: t.retweetCount || 0 }))
    .sort((a, b) => b.val - a.val);
  let hRTs = 0;
  for (let i = 0; i < rtsSorted.length; i += 1) {
    const rank = i + 1;
    if (rtsSorted[i].val >= rank) hRTs = rank; else break;
  }

  const top = likesSorted.slice(0, hLikes).map((e) => e.tweet);
  return {
    hIndexLikes: hLikes,
    hIndexRetweets: hRTs,
    countedTweetIds: top.map((t) => t.id),
    topTweets: top,
    engagementsSorted: withEngagement.map((e) => e.engagement),
  };
}

export function computeXIndexForWindow(tweets: Tweet[], window: XIndexWindow, now = new Date()): XIndexResult {
  const filtered = filterTweetsByWindow(tweets, window, now);
  return computeXIndex(filtered);
}



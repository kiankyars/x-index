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
  hIndex: number;
  countedTweetIds: string[];
  topTweets: Tweet[]; // tweets that count toward h, sorted by engagement desc
  engagementsSorted: number[]; // sorted desc
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

  let h = 0;
  for (let i = 0; i < withEngagement.length; i += 1) {
    const rank = i + 1;
    if (withEngagement[i].engagement >= rank) {
      h = rank;
    } else {
      break;
    }
  }

  const top = withEngagement.slice(0, h).map((e) => e.tweet);
  return {
    hIndex: h,
    countedTweetIds: top.map((t) => t.id),
    topTweets: top,
    engagementsSorted: withEngagement.map((e) => e.engagement),
  };
}

export function computeXIndexForWindow(tweets: Tweet[], window: XIndexWindow, now = new Date()): XIndexResult {
  const filtered = filterTweetsByWindow(tweets, window, now);
  return computeXIndex(filtered);
}



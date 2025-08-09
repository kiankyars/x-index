"use client";

import { useEffect, useMemo, useState } from "react";

type ApiResponse = {
  username: string;
  window: "all" | "30d" | "90d";
  result: {
    hIndex: number;
    engagementsSorted: number[];
    countedTweetIds: string[];
    topTweets: Array<{
      id: string;
      text: string;
      createdAt: string;
      likeCount: number;
      retweetCount: number;
      url?: string;
    }>;
  };
} | { error: string };

export default function Home() {
  const [username, setUsername] = useState("");
  const [windowVal, setWindowVal] = useState<"all" | "30d" | "90d">("all");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runQuery(e?: React.FormEvent) {
    e?.preventDefault();
    if (!username) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/x-index?username=${encodeURIComponent(username)}&window=${windowVal}`, { cache: "no-store" });
      const json = (await res.json()) as ApiResponse;
      if (!res.ok) {
        const errMsg = (json && "error" in json && typeof json.error === "string") ? json.error : "Request failed";
        throw new Error(errMsg);
      }
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const chart = useMemo(() => {
    const engagements = (data && "result" in data) ? data.result.engagementsSorted : [];
    if (!engagements.length) return null;
    const max = Math.max(...engagements);
    return (
      <div className="w-full max-w-2xl space-y-2">
        <div className="text-sm text-foreground/80">Engagement distribution (likes+RT, desc)</div>
        <div className="space-y-1">
          {engagements.slice(0, 50).map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 text-right text-xs text-foreground/60">{i + 1}</div>
              <div className="h-2 bg-foreground/10 rounded" style={{ width: `${max ? (v / max) * 100 : 0}%` }} />
              <div className="text-xs text-foreground/60">{v}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [data]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const u = url.searchParams.get("u");
    const w = url.searchParams.get("w") as "all" | "30d" | "90d" | null;
    if (u) setUsername(u);
    if (w) setWindowVal(w);
  }, []);

  return (
    <div className="font-sans min-h-screen p-8 sm:p-16 flex flex-col items-center gap-8">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">X-index</h1>
      <form onSubmit={runQuery} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
        <input
          className="flex-1 rounded-md border border-foreground/15 bg-background px-3 py-2 outline-none focus:ring-2 ring-foreground/20"
          placeholder="Enter @username"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
        />
        <select
          className="rounded-md border border-foreground/15 bg-background px-3 py-2"
          value={windowVal}
          onChange={(e) => setWindowVal(e.target.value as "all" | "30d" | "90d")}
        >
          <option value="all">All time</option>
          <option value="30d">Last 30d</option>
          <option value="90d">Last 90d</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-foreground text-background px-4 py-2 font-medium disabled:opacity-50"
          disabled={loading || !username}
        >
          {loading ? "Computing…" : "Compute"}
        </button>
      </form>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {data && "result" in data && (
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-lg">
            <span className="opacity-70">@{data.username}</span> H-index: <span className="font-semibold">{data.result.hIndex}</span> ({data.window})
          </div>
          <div>
            <a
              className="inline-block rounded-md bg-[#1DA1F2] text-white px-4 py-2 text-sm font-medium hover:opacity-90"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`My X-index is ${data.result.hIndex}. What’s yours?`)}&url=${encodeURIComponent(`${window.location.origin}/u/${data.username}?w=${data.window}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              Tweet my X-index
            </a>
          </div>
          {chart}
          <div className="space-y-3">
            <div className="text-sm text-foreground/80">Top tweets contributing to H-index</div>
            <ul className="space-y-3">
              {data.result.topTweets.map((t) => (
                <li key={t.id} className="rounded-md border border-foreground/10 p-3">
                  <div className="text-sm mb-1 line-clamp-3">{t.text}</div>
                  <div className="text-xs opacity-70 flex items-center gap-3">
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    <span>❤ {t.likeCount}</span>
                    <span>↻ {t.retweetCount}</span>
                    {t.url && (
                      <a className="underline" href={t.url} target="_blank" rel="noreferrer">
                        View
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

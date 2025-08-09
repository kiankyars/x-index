"use client";

import { useEffect, useState } from "react";

type Row = { username: string; name: string | null; avatar_url: string | null; h_index: number; window: string; computed_at: string };

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [windowVal, setWindowVal] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/leaderboard?window=${windowVal}&limit=50`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed");
        if (!cancelled) setRows(json.results || []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [windowVal]);

  return (
    <div className="font-sans min-h-screen p-8 sm:p-16 flex flex-col items-center gap-8">
      <h1 className="text-2xl font-semibold">Leaderboard</h1>
      <div className="flex gap-3">
        <select className="rounded-md border border-foreground/15 bg-background px-3 py-2" value={windowVal} onChange={(e) => setWindowVal(e.target.value)}>
          <option value="all">All time</option>
          <option value="30d">Last 30d</option>
          <option value="90d">Last 90d</option>
        </select>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {!loading && (
        <ol className="w-full max-w-2xl space-y-2">
          {rows.map((r, idx) => (
            <li key={r.username} className="flex items-center gap-3 p-3 border border-foreground/10 rounded-md">
              <div className="w-8 text-right opacity-60">{idx + 1}</div>
              {r.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-foreground/10" />
              )}
              <div className="flex-1">
                <div className="font-medium">{r.name || r.username}</div>
                <div className="text-xs opacity-70">@{r.username}</div>
              </div>
              <div className="font-semibold">{r.h_index}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}



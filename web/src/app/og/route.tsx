import { ImageResponse } from "next/og";
import { computeXIndexForWindow, type XIndexWindow, type Tweet } from "@/lib/xIndex";
import { fetchRecentTweets, getUserByUsername } from "@/lib/xClient";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("u");
  const windowVal = (searchParams.get("w") as XIndexWindow) || "all";

  if (!handle) {
    return new Response("Missing u", { status: 400 });
  }

  const bearerToken = process.env.X_BEARER_TOKEN ?? "";

  let displayName = `@${handle}`;
  let hLikes = 0;
  let hRTs = 0;

  try {
    const tweets: Tweet[] = bearerToken
      ? await fetchRecentTweets({ username: handle, bearerToken })
      : Array.from({ length: 40 }).map((_, i) => ({
          id: String(i + 1),
          text: `Mock tweet ${i + 1}`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
          likeCount: Math.floor(Math.random() * 50),
          retweetCount: Math.floor(Math.random() * 30),
        }));
    if (bearerToken) {
      const user = await getUserByUsername(handle, bearerToken);
      displayName = `${user.name} (@${user.username})`;
    }
    const result = computeXIndexForWindow(tweets, windowVal);
    hLikes = result.hIndexLikes;
    hRTs = result.hIndexRetweets;
  } catch {
    // keep defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#ededed",
          fontSize: 64,
          padding: 48,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.08, background: "radial-gradient(1000px 400px at 50% -100px, #ffffff 0, transparent 70%)" }} />
        <div style={{ fontSize: 56, opacity: 0.95 }}>X-index</div>
        <div style={{ fontSize: 40, marginTop: 12 }}>{displayName}</div>
        <div style={{ marginTop: 24, display: "flex", gap: 24, alignItems: "baseline", fontSize: 40 }}>
          <div>Likes H: <b style={{ fontSize: 80 }}>{hLikes}</b></div>
          <div>RTs H: <b style={{ fontSize: 80 }}>{hRTs}</b></div>
          <span style={{ fontSize: 36, opacity: 0.8 }}>({windowVal})</span>
        </div>
        <div style={{ marginTop: 24, fontSize: 28, opacity: 0.7 }}>x-index.app</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}



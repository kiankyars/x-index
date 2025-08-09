import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") ?? "x-index";
  const h = searchParams.get("h") ?? "0";
  const rank = searchParams.get("rank") ?? "-";
  const nextTarget = searchParams.get("next") ?? String(Number(h) + 1);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "black",
          color: "white",
          padding: 64,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 48, opacity: 0.7 }}>x-index</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <div style={{ fontSize: 128, fontWeight: 800 }}>{h}</div>
          <div style={{ fontSize: 32 }}>for {name}</div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 28 }}>
          <div>rank #{rank}</div>
          <div>next target: {nextTarget}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}



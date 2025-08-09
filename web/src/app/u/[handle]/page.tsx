import Link from "next/link";
import { notFound } from "next/navigation";
import { computeXIndexForWindow, type XIndexWindow } from "@/lib/xIndex";
import { fetchRecentTweets, getUserByUsername } from "@/lib/xClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ handle: string }>; searchParams?: Promise<{ w?: XIndexWindow }>; };

export default async function UserPage(props: Props) {
  const { handle } = await props.params;
  const search = (await props.searchParams) ?? {};
  const windowVal = (search.w as XIndexWindow) || "all";

  const bearerToken = process.env.X_BEARER_TOKEN ?? "";
  if (!bearerToken) {
    // show mock page when no token
    const mockTweets = Array.from({ length: 50 }).map((_, i) => ({
      id: String(i + 1),
      text: `Mock tweet ${i + 1}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      likeCount: Math.floor(Math.random() * 50),
      retweetCount: Math.floor(Math.random() * 30),
      url: `https://x.com/${handle}/status/${i + 1}`,
    }));
    const result = computeXIndexForWindow(mockTweets, windowVal);
    return (
      <div className="font-sans min-h-screen p-8 sm:p-16 flex flex-col items-center gap-8">
        <h1 className="text-2xl font-semibold">@{handle}</h1>
        <div>H-index: <span className="font-semibold">{result.hIndex}</span> ({windowVal})</div>
        <Link className="underline" href={`/?u=${encodeURIComponent(handle)}&w=${windowVal}`}>Try another</Link>
      </div>
    );
  }

  try {
    const user = await getUserByUsername(handle, bearerToken);
    const tweets = await fetchRecentTweets({ username: handle, bearerToken });
    const result = computeXIndexForWindow(tweets, windowVal);
    return (
      <div className="font-sans min-h-screen p-8 sm:p-16 flex flex-col items-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-semibold">{user.name}</div>
          <div className="opacity-70">@{user.username}</div>
        </div>
        <div>H-index: <span className="font-semibold">{result.hIndex}</span> ({windowVal})</div>
        <Link className="underline" href={`/?u=${encodeURIComponent(handle)}&w=${windowVal}`}>Back</Link>
      </div>
    );
  } catch {
    notFound();
  }
}



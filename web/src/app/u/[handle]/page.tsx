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
  if (!bearerToken) throw new Error("Server not configured with X_BEARER_TOKEN");

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
        <div>Likes H: <span className="font-semibold">{result.hIndexLikes}</span> · RTs H: <span className="font-semibold">{result.hIndexRetweets}</span> ({windowVal})</div>
        <Link className="underline" href={`/?u=${encodeURIComponent(handle)}&w=${windowVal}`}>Back</Link>
      </div>
    );
  } catch {
    notFound();
  }
}



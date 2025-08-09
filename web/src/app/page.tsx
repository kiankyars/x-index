"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [username, setUsername] = useState("");
  const [h, setH] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function compute() {
    setLoading(true);
    try {
      const res = await fetch(`/api/xindex?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setH(data.h);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">x-index</h1>
      <div className="flex gap-2 w-full max-w-md">
        <input
          className="flex-1 border rounded px-3 py-2 bg-transparent"
          placeholder="@handle"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded bg-white text-black disabled:opacity-50"
          onClick={compute}
          disabled={loading}
        >
          {loading ? "Computing..." : "Compute"}
        </button>
      </div>
      {h !== null && (
        <div className="text-xl">H-index: {h}</div>
      )}
      <Link className="underline opacity-80" href="/api/auth/signin">Sign in with X</Link>
    </div>
  );
}

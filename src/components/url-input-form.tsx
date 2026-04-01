"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EMPTY_URLS = ["", "", ""];

export function UrlInputForm() {
  const [urls, setUrls] = useState<string[]>(EMPTY_URLS);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const activeUrls = urls.map((url) => url.trim()).filter(Boolean);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (activeUrls.length < 1 || activeUrls.length > 3) {
      setError("URLは1〜3件入力してください。");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputUrls: activeUrls })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "比較の開始に失敗しました。");
        return;
      }

      const body = (await response.json()) as { jobId: string };
      router.push(`/result/${body.jobId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Compare input</h2>
      <p>SaaS pricing URLを1〜3件入力してください。</p>
      {urls.map((url, index) => (
        <label key={index}>
          URL {index + 1}
          <input
            type="url"
            value={url}
            placeholder="https://example.com/pricing"
            onChange={(event) => {
              const next = [...urls];
              next[index] = event.target.value;
              setUrls(next);
            }}
          />
        </label>
      ))}
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Start comparison"}
      </button>
    </form>
  );
}

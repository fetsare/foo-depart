"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";

interface StopResult {
  extId: string;
  id?: string;
  name: string;
  lon?: number;
  lat?: number;
  raw: unknown;
}

interface LookupResponse {
  stops?: StopResult[];
  error?: string;
}

export default function StopLookupPage() {
  const [accessId, setAccessId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stops, setStops] = useState<StopResult[]>([]);
  const [copied, setCopied] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const resultCountLabel = useMemo(() => {
    if (stops.length === 0) {
      return "No stops yet.";
    }
    if (stops.length === 1) {
      return "1 stop found";
    }
    return `${stops.length} stops found`;
  }, [stops.length]);

  const copyText = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setError("Unable to copy automatically. Please copy manually.");
    }
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStops([]);
    setExpanded({});

    const trimmedAccessId = accessId.trim();
    const trimmedQuery = query.trim();

    if (!trimmedAccessId || !trimmedQuery) {
      setError("Please provide both an access token and search text.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stops/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessId: trimmedAccessId,
          query: trimmedQuery,
        }),
      });

      const payload = (await response.json()) as LookupResponse;
      if (!response.ok) {
        setError(payload.error || "Search failed.");
        return;
      }

      setStops(payload.stops || []);
      if (!payload.stops || payload.stops.length === 0) {
        setError("No matching stops found.");
      }
    } catch {
      setError("Network error while searching stops.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="absolute top-4 left-4 text-sm sm:text-base md:text-lg lg:text-xl text-blue-400 focus:text-blue-500 hover:cursor-pointer hover:underline"
        >
          Back
        </Link>

        <h1 className="text-3xl font-bold mb-6">Stop ID Lookup</h1>
        <p className="mb-6 text-gray-300">
          Search the Resrobot location API and copy the
          <span className="mx-1 rounded bg-blue-950 px-2 py-0.5 font-mono text-blue-300">
            extId
          </span>
          value into
          <span className="font-mono"> departures.json</span>.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label
              htmlFor="accessId"
              className="block text-sm font-medium mb-2"
            >
              Trafiklab access token
            </label>
            <input
              id="accessId"
              type="password"
              value={accessId}
              onChange={(event) => setAccessId(event.target.value)}
              placeholder="Enter your RESROBOT_ACCESS_ID"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="query" className="block text-sm font-medium mb-2">
              Search string
            </label>
            <input
              id="query"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Example: "Göteborg" or "Kista"'
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Searching..." : "Search stops"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Results</h2>
          <span className="text-sm text-gray-400">{resultCountLabel}</span>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-red-700 bg-red-950 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-900 bg-gray-950">
          <table className="w-full table-fixed text-sm text-gray-200">
            <colgroup>
              <col className="w-36" />
              <col />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-36" />
            </colgroup>
            <thead className="bg-black/40 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-3 py-2 text-left font-medium">extId</th>
                <th className="px-3 py-2 text-left font-medium">name</th>
                <th className="px-3 py-2 text-left font-medium">lat</th>
                <th className="px-3 py-2 text-left font-medium">lon</th>
                <th className="px-3 py-2 text-right font-medium">json</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((stop, index) => {
                const rowKey = `${stop.extId}-${index}`;
                const isExpanded = Boolean(expanded[rowKey]);

                return (
                  <Fragment key={rowKey}>
                    <tr
                      key={rowKey}
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [rowKey]: !prev[rowKey],
                        }))
                      }
                      className="cursor-pointer border-t border-gray-900 hover:bg-black/30"
                    >
                      <td className="px-3 py-2 font-mono text-blue-300">{stop.extId}</td>
                      <td className="px-3 py-2 truncate">{stop.name}</td>
                      <td className="px-3 py-2 font-mono text-gray-300">{stop.lat ?? "-"}</td>
                      <td className="px-3 py-2 font-mono text-gray-300">{stop.lon ?? "-"}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            copyText(
                              JSON.stringify(stop.raw, null, 2),
                              `${rowKey}-raw-json`,
                            );
                          }}
                          className="rounded-md border border-gray-600 px-3 py-1 text-xs hover:bg-gray-900"
                        >
                          {copied === `${rowKey}-raw-json`
                            ? "Copied JSON"
                            : "Copy JSON"}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-t border-gray-900 bg-black/20">
                        <td colSpan={5} className="px-3 py-3">
                          <pre className="overflow-x-auto rounded-md border border-gray-900 bg-black p-3 text-xs text-gray-200">
                            {JSON.stringify(stop.raw, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

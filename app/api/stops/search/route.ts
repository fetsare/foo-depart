import { NextResponse } from "next/server";

interface StopLocation {
  extId: string;
  id?: string;
  name: string;
  lon?: number;
  lat?: number;
  raw: unknown;
}

interface ResrobotLocationNameResponse {
  StopLocation?: unknown[] | unknown;
  stopLocation?: unknown[] | unknown;
  stopLocationOrCoordLocation?: unknown[] | unknown;
  LocationList?: {
    StopLocation?: unknown[] | unknown;
    stopLocation?: unknown[] | unknown;
  };
}

function asArray<T>(value: T[] | T | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value !== undefined) {
    return [value];
  }

  return [];
}

function normalizeStop(raw: unknown): StopLocation | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const stop = raw as Record<string, unknown>;
  const name = typeof stop.name === "string" ? stop.name : "";
  const extIdValue = stop.extId ?? stop.id;

  if (!name || (typeof extIdValue !== "string" && typeof extIdValue !== "number")) {
    return null;
  }

  return {
    extId: String(extIdValue),
    id:
      typeof stop.id === "string" || typeof stop.id === "number"
        ? String(stop.id)
        : undefined,
    name,
    lon: typeof stop.lon === "number" ? stop.lon : undefined,
    lat: typeof stop.lat === "number" ? stop.lat : undefined,
    raw,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      accessId?: string;
      query?: string;
    };
    const accessId = body.accessId?.trim() || "";
    const query = body.query?.trim() || "";

    if (!accessId) {
      return NextResponse.json(
        { error: "Access token is required." },
        { status: 400 },
      );
    }

    if (!query) {
      return NextResponse.json(
        { error: "Search text is required." },
        { status: 400 },
      );
    }

    const url = new URL("https://api.resrobot.se/v2.1/location.name");
    url.searchParams.set("input", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("accessId", accessId);

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Resrobot request failed with status ${response.status}.` },
        { status: response.status },
      );
    }
    const data = (await response.json()) as ResrobotLocationNameResponse;

    const nestedStopLocations = asArray(data.stopLocationOrCoordLocation).map(
      (item) => {
        if (!item || typeof item !== "object") {
          return item;
        }

        const maybeContainer = item as Record<string, unknown>;
        return maybeContainer.StopLocation ?? maybeContainer.stopLocation ?? item;
      },
    );

    const rawStops = [
      ...asArray(data.StopLocation),
      ...asArray(data.stopLocation),
      ...asArray(data.LocationList?.StopLocation),
      ...asArray(data.LocationList?.stopLocation),
      ...nestedStopLocations,
    ];

    const deduped = new Map<string, StopLocation>();
    for (const stop of rawStops) {
      const normalized = normalizeStop(stop);
      if (!normalized) {
        continue;
      }

      const key = normalized.extId;
      if (!deduped.has(key)) {
        deduped.set(key, normalized);
      }
    }

    const stops = Array.from(deduped.values());

    return NextResponse.json({ stops });
  } catch (error) {
    console.error("Stop lookup failed:", error);
    return NextResponse.json(
      { error: "Unable to search stops right now." },
      { status: 500 },
    );
  }
}

"use server";

import data from "@/lib/departures.json";
import {
  type Station,
  type ApiDeparture,
  type RealtimeDeparture,
  type GitHubContributor,
} from "@/lib/types";
import {
  TRAFIKLAB_REALTIME_API_BASE_URL,
  TRAFIKLAB_REALTIME_API_KEY,
  REALTIME_CACHE_SECONDS,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_TOKEN,
} from "@/lib/constants";

const { stations } = data as { stations: Station[] };

// isolates every assumption about the Trafiklab Realtime API's raw shape,
// so a future field-name change only needs a fix here
function mapRealtimeDeparture(raw: RealtimeDeparture): ApiDeparture {
  return {
    name: raw.route.designation,
    time: raw.realtime || raw.scheduled,
    direction: raw.route.direction || raw.route.destination?.name || "",
    transportType: raw.route.transport_mode,
    canceled: raw.canceled,
    delayMinutes: Math.round((raw.delay || 0) / 60),
    isRealtime: raw.is_realtime,
  };
}

// function with cached api call, makes sure we dont overuse api quota
export async function fetchRawDepartures() {
  const fetchStartTime = Date.now();

  const allResults = await Promise.all(
    stations.map(async (station) => {
      try {
        const response = await fetch(
          `${TRAFIKLAB_REALTIME_API_BASE_URL}/departures/${station.id}?key=${TRAFIKLAB_REALTIME_API_KEY}`,
          {
            next: { revalidate: REALTIME_CACHE_SECONDS },
          },
        );
        if (!response.ok) {
          console.error(
            `Failed to fetch departures for station ${station.name}`,
          );
          return { station, departures: [] };
        }

        const data = await response.json();
        const rawDepartures: RealtimeDeparture[] = data.departures || [];
        const departures: ApiDeparture[] = rawDepartures.map(
          mapRealtimeDeparture,
        );
        return { station, departures };
      } catch (stationError) {
        console.error(
          `Error fetching departures for station ${station.id}:`,
          stationError,
        );
        return { station, departures: [] };
      }
    }),
  );

  console.log(`Total fetch time: ${Date.now() - fetchStartTime}ms`);
  return allResults;
}

export async function fetchContributors(): Promise<GitHubContributor[]> {
  if (!GITHUB_OWNER || !GITHUB_REPO) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contributors`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch contributors");
      return [];
    }

    const contributors = (await response.json()) as GitHubContributor[];
    return contributors.filter((c) => c.type !== "Bot");
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return [];
  }
}

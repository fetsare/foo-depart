"use server";

import data from "@/lib/departures.json";
import {
  type Station,
  type ApiDeparture,
  type GitHubContributor,
} from "@/lib/types";
import {
  RESROBOT_API_BASE_URL,
  RESROBOT_ACCESS_ID,
  API_DURATION,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_TOKEN,
} from "@/lib/constants";

const { stations } = data as { stations: Station[] };

// function with cached api call, makes sure we dont overuse api quota
export async function fetchRawDepartures() {
  const fetchStartTime = Date.now();

  const allResults = await Promise.all(
    stations.map(async (station) => {
      try {
        const response = await fetch(
          `${RESROBOT_API_BASE_URL}?id=${station.id}&format=json&accessId=${RESROBOT_ACCESS_ID}&duration=${API_DURATION}`,
          {
            next: { revalidate: 600 },
          },
        );
        if (!response.ok) {
          console.error(
            `Failed to fetch departures for station ${station.name}`,
          );
          return { station, departures: [] };
        }

        const data = await response.json();
        const departures: ApiDeparture[] = data.Departure || [];
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

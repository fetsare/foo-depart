"use server";

import data from "@/lib/departures.json";
import { type Station, type ApiDeparture, type GitHubContributor } from "@/lib/types";
import {
  RESROBOT_API_BASE_URL,
  RESROBOT_ACCESS_ID,
  API_DURATION,
} from "@/lib/constants";

const { stations } = data as { stations: Station[] };

// function with cached api call, makes sure we dont overuse api quota
export async function fetchRawDepartures() {
  const fetchStartTime = Date.now();

  const allResults = await Promise.all(
    stations.map(async (station) => {
      try {
        const fetchTime = Date.now();
        const response = await fetch(
          `${RESROBOT_API_BASE_URL}?id=${station.id}&format=json&accessId=${RESROBOT_ACCESS_ID}&duration=${API_DURATION}`,
          {
            next: { revalidate: 600 },
          },
        );
        const responseTime = Date.now() - fetchTime;

        // this is not guarantee but its something
        // const isCached = responseTime < 10;
        // console.log(
        //   `[${station.name}] ${isCached ? "CACHE HIT" : "CACHE MISS"} (${responseTime}ms)`,
        // );

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
  try {
    const response = await fetch(
      `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.NEXT_PUBLIC_BASE_URL}/api/contributors`,
      {
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch contributors");
      return [];
    }

    const contributors: GitHubContributor[] = await response.json();
    return contributors;
  } catch (error) {
    console.error("Error fetching contributors:", error);
    return [];
  }
}

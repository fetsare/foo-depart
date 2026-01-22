"use server";

import data from "@/lib/departures.json";
import {
  type Station,
  type ApiDeparture,
} from "@/lib/types";
import {
  RESROBOT_API_BASE_URL,
  RESROBOT_ACCESS_ID,
  API_DURATION,
} from "@/lib/constants";

const { stations } = data as { stations: Station[] };

// function with cached api call, makes sure we dont overuse api quota
export async function fetchRawDepartures() {
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

  return allResults;
}
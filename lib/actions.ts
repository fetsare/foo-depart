"use server";

import data from "@/lib/departures.json";
import {
  type Station,
  type ProcessedDeparture,
  type ApiDeparture,
} from "@/lib/types";
import { formatTimeDifference, removeParentheses } from "@/lib/utils";

const { stations } = data as { stations: Station[] };

const RESROBOT_API_BASE_URL = process.env.RESROBOT_API_BASE_URL;
const RESROBOT_ACCESS_ID = process.env.RESROBOT_ACCESS_ID;
const API_DURATION = process.env.API_DURATION || "120";

export async function fetchDepartures() {
  if (!RESROBOT_ACCESS_ID) {
    throw new Error("API access ID is missing");
  }

  const allResults = await Promise.all(
    stations.map(async (station) => {
      try {
        const stationName = station.name;
        const id = station.id;
        const allowedDepartures = station.allowedDepartures;

        const response = await fetch(
          `${RESROBOT_API_BASE_URL}?id=${id}&format=json&accessId=${RESROBOT_ACCESS_ID}&duration=${API_DURATION}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          console.error(
            `Failed to fetch departures for station ${station.name}`
          );
          return [];
        }

        const data = await response.json();
        const departures: ApiDeparture[] = data.Departure || [];

        const processedDepartures = departures
          .map((departure) => {
            const timeWithoutSeconds = departure.time
              .split(":")
              .slice(0, 2)
              .join(":");
            const transportName = departure.name.match(
              /\b(Buss|Tunnelbana|Tåg|Spårväg)\s*\d+\b/i
            );
            const timeDifference = formatTimeDifference(departure.time);

            return {
              name: transportName ? transportName[0] : "Unknown",
              time: timeWithoutSeconds,
              timeLeft: timeDifference,
              direction: removeParentheses(departure.direction),
              station: stationName,
            };
          })
          .filter(
            (departure) =>
              departure.time !== "Departed" &&
              departure.name !== "Unknown" &&
              typeof departure.timeLeft === "number" &&
              departure.timeLeft > 8 &&
              allowedDepartures.includes(departure.name) &&
              departure.direction !== "Akalla T-bana"
          );

        return processedDepartures;
      } catch (stationError) {
        console.error(
          `Error fetching departures for station ${station.id}:`,
          stationError
        );
        return [];
      }
    })
  );

  const newBusses: ProcessedDeparture[] = [];
  const newTrains: ProcessedDeparture[] = [];

  allResults.flat().forEach((result) => {
    switch (result.name.split(" ")[0]) {
      case "Buss":
        newBusses.push(result);
        break;
      default:
        newTrains.push(result);
    }
  });

  const allDepartures = [...newBusses, ...newTrains]
    .sort((a, b) => (a.timeLeft as number) - (b.timeLeft as number))
    .slice(0, 10);

  return allDepartures;
}

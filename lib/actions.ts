"use server";

import data from "@/lib/departures.json";
import {
  type Station,
  type ProcessedDeparture,
  type ApiDeparture,
} from "@/lib/types";
import { formatTimeDifference, removeParentheses } from "@/lib/utils";
import {
  RESROBOT_API_BASE_URL,
  RESROBOT_ACCESS_ID,
  API_DURATION,
  DEFAULT_MIN_TIME_THRESHOLD,
  MAX_DEPARTURES_TO_DISPLAY,
  validateConfig,
} from "@/lib/constants";

const { stations } = data as { stations: Station[] };

export async function fetchDepartures() {
  validateConfig();

  const allResults = await Promise.all(
    stations.map(async (station) => {
      try {
        const stationName = station.name;
        const id = station.id;

        const response = await fetch(
          `${RESROBOT_API_BASE_URL}?id=${id}&format=json&accessId=${RESROBOT_ACCESS_ID}&duration=${API_DURATION}`,
          {
            next: { revalidate: 600 },
          },
        );
        if (!response.ok) {
          console.error(
            `Failed to fetch departures for station ${station.name}`,
          );
          return [];
        }

        const data = await response.json();
        const departures: ApiDeparture[] = data.Departure || [];

        const departureConfigMap = new Map(
          station.departures.map((d) => [d.line, d]),
        );

        const processedDepartures = departures
          .map((departure) => {
            const timeWithoutSeconds = departure.time
              .split(":")
              .slice(0, 2)
              .join(":");
            const match = departure.name.match(
              /\b(Buss|Tunnelbana|Tåg|Spårväg)\s*(\d+[A-Z]?)\b/i,
            );
            const timeDifference = formatTimeDifference(departure.time);

            if (!match) {
              return {
                name: "Unknown",
                transportType: "Unknown",
                time: timeWithoutSeconds,
                timeLeft: timeDifference,
                direction: removeParentheses(departure.direction),
                station: stationName,
              };
            }

            return {
              name: match[2],
              transportType: match[1],
              time: timeWithoutSeconds,
              timeLeft: timeDifference,
              direction: removeParentheses(departure.direction),
              station: stationName,
            };
          })
          .filter((departure) => {
            const config = departureConfigMap.get(departure.name);

            if (!config) return false;

            if (
              departure.time === "Departed" ||
              departure.name === "Unknown" ||
              typeof departure.timeLeft !== "number"
            ) {
              return false;
            }

            const minTimeThreshold =
              config.minTimeThreshold ?? DEFAULT_MIN_TIME_THRESHOLD;
            if (departure.timeLeft <= minTimeThreshold) return false;

            if (config.directions) {
              const directionMatches = config.directions.some((filter) =>
                departure.direction
                  .toLowerCase()
                  .includes(filter.toLowerCase()),
              );
              if (!directionMatches) return false;
            }

            return true;
          });
        return processedDepartures;
      } catch (stationError) {
        console.error(
          `Error fetching departures for station ${station.id}:`,
          stationError,
        );
        return [];
      }
    }),
  );

  const newBusses: ProcessedDeparture[] = [];
  const newTrains: ProcessedDeparture[] = [];

  allResults.flat().forEach((result) => {
    switch (result.transportType) {
      case "Buss":
        newBusses.push(result);
        break;
      default:
        newTrains.push(result);
    }
  });
  const allDepartures = [...newBusses, ...newTrains].sort(
    (a, b) => (a.timeLeft as number) - (b.timeLeft as number),
  );

  const departuresByLineAndDirection = new Map<string, ProcessedDeparture[]>();
  allDepartures.forEach((dep) => {
    const key = `${dep.name}|${dep.direction}`;
    const existing = departuresByLineAndDirection.get(key) || [];
    existing.push(dep);
    departuresByLineAndDirection.set(key, existing);
  });

  const departuresWithNext = allDepartures.map((dep) => {
    const key = `${dep.name}|${dep.direction}`;
    const sameLine = departuresByLineAndDirection.get(key) || [];
    const currentIndex = sameLine.findIndex(
      (d) => d.time === dep.time && d.station === dep.station,
    );
    const nextDep = sameLine[currentIndex + 1];

    let nextDepartureTimeLeft: number | undefined = undefined;
    if (nextDep && typeof nextDep.timeLeft === "number") {
      nextDepartureTimeLeft = nextDep.timeLeft;
    }

    return {
      ...dep,
      nextDepartureTimeLeft,
    };
  });

  return departuresWithNext.slice(0, MAX_DEPARTURES_TO_DISPLAY);
}

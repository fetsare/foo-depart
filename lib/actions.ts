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

// function with cached api call, makes sure we dont overuse api quota
async function fetchRawDepartures() {
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


function processDepartures(rawData: { station: Station; departures: ApiDeparture[] }[]) {
  const allProcessedDepartures: ProcessedDeparture[] = [];

  rawData.forEach(({ station, departures }) => {
    const stationName = station.name;
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
            config: undefined,
          };
        }

        return {
          name: match[2],
          transportType: match[1],
          time: timeWithoutSeconds,
          timeLeft: timeDifference,
          direction: removeParentheses(departure.direction),
          station: stationName,
          config: departureConfigMap.get(match[2]),
        };
      })
      .filter((departure) => {
        const config = departure.config;

        if (!config) return false;

        if (
          departure.time === "Departed" ||
          departure.name === "Unknown" ||
          typeof departure.timeLeft !== "number"
        ) {
          return false;
        }

        // Re-calculate time threshold on every load with fresh time
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
      })
      .map(({ config, ...rest }) => rest); // Remove config before returning

    allProcessedDepartures.push(...processedDepartures);
  });

  const newBusses: ProcessedDeparture[] = [];
  const newTrains: ProcessedDeparture[] = [];

  allProcessedDepartures.forEach((result) => {
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

export async function fetchDepartures() {
  validateConfig();
  
  const rawData = await fetchRawDepartures();
  
  return processDepartures(rawData);
}

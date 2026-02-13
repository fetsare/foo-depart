import {
  DEFAULT_MIN_TIME_THRESHOLD,
  MAX_DEPARTURES_TO_DISPLAY,
} from "@/lib/constants";
import { ApiDeparture, ProcessedDeparture, Station } from "./types";

/**
 * Get the current date/time in Stockholm timezone
 * Since we are only using swedish trafic data we force all clients to Stockholm timezone
 */
export const getStockholmTime = (): Date => {
  const stockholmTimeString = new Date().toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
  });
  return new Date(stockholmTimeString);
};

export const formatTimeDifference = (departureTime: string): number => {
  const now = getStockholmTime();

  const [hours, minutes] = departureTime.split(":").map(Number);

  const departureDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
  );

  if (departureDate < now) {
    departureDate.setDate(departureDate.getDate() + 1);
  }

  const differenceInMs = departureDate.getTime() - now.getTime();

  const differenceInMin = Math.ceil(differenceInMs / 1000 / 60);

  return differenceInMin;
};

export const removeParentheses = (input: string): string => {
  return input.replace(/\s*\(.*?\)/g, "");
};

export const formatMinutesToReadable = (minutes: number | string): string => {
  if (typeof minutes !== "number") {
    return String(minutes);
  }
  // For 60+ minutes: round minutes then show whole hours or .5 when remainder >= 30
  if (minutes >= 60) {
    const total = Math.round(minutes);
    const wholeHours = Math.floor(total / 60);
    const remainder = total % 60;
    const hasHalf = remainder >= 30;
    const display = hasHalf ? `${wholeHours}.5` : `${wholeHours}`;
    return `${display} h`;
  }

  // Keep values under 60 unchanged
  return `${minutes} min`;
};

export function processDepartures(
  rawData: { station: Station; departures: ApiDeparture[] }[],
) {
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

        const config = departureConfigMap.get(match[2]);
        
        // Check if this specific direction should be prioritized
        let isPrioritized = config?.prioritized || false;
        if (isPrioritized && config?.prioritizedDirections) {
          const direction = removeParentheses(departure.direction);
          isPrioritized = config.prioritizedDirections.some((filter) =>
            direction.toLowerCase().includes(filter.toLowerCase()),
          );
        }
        
        return {
          name: match[2],
          transportType: match[1],
          time: timeWithoutSeconds,
          timeLeft: timeDifference,
          direction: removeParentheses(departure.direction),
          station: stationName,
          config: config,
          prioritized: isPrioritized,
        };
      })
      .filter((departure) => {
        const config = departure.config;
        if (!config) return false;

        if (
          departure.time === "Departed" ||
          departure.name === "Unknown" ||
          departure.timeLeft < 0
        ) {
          return false;
        }

        const minTimeThreshold =
          config.minTimeThreshold ?? DEFAULT_MIN_TIME_THRESHOLD;
        if (departure.timeLeft <= minTimeThreshold) return false;

        if (config.directions) {
          const directionMatches = config.directions.some((filter) =>
            departure.direction.toLowerCase().includes(filter.toLowerCase()),
          );
          if (!directionMatches) return false;
        }

        return true;
      })
      .map(({ config, ...rest }) => rest); // Remove config but keep prioritized

    allProcessedDepartures.push(...processedDepartures);
  });

  // First, sort all departures by time
  const sortedByTime = allProcessedDepartures.sort(
    (a, b) => (a.timeLeft as number) - (b.timeLeft as number),
  );

  // Separate prioritized and non-prioritized departures
  const prioritizedDepartures = sortedByTime.filter((d) => d.prioritized);
  const nonPrioritizedDepartures = sortedByTime.filter((d) => !d.prioritized);

  // Combine with prioritized departures first (already sorted by time)
  const allDepartures = [...prioritizedDepartures, ...nonPrioritizedDepartures];

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

  // keep only the first occurrence of each line+direction combination but the next field will still show
  const seen = new Set<string>();
  const uniqueDepartures = departuresWithNext.filter((dep) => {
    const key = `${dep.name}|${dep.direction}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return uniqueDepartures.slice(0, MAX_DEPARTURES_TO_DISPLAY);
}

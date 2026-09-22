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

// departureTime is a full ISO datetime string (e.g. "2026-09-22T19:26:52"),
// naive local Stockholm wall-clock time, same reference frame as getStockholmTime().
export const formatTimeDifference = (departureTime: string): number => {
  const now = getStockholmTime();
  const departureDate = new Date(departureTime);

  const differenceInMs = departureDate.getTime() - now.getTime();

  return Math.ceil(differenceInMs / 1000 / 60);
};

export const removeParentheses = (input: string): string => {
  return input.replace(/\s*\(.*?\)/g, "");
};

// departureTime is an ISO datetime string like "2026-09-22T19:26:52";
// slice the clock portion directly rather than going through Date/Intl,
// since the string's timezone is ambiguous (see formatTimeDifference above).
export const formatClockTime = (departureTime: string): string =>
  departureTime.slice(11, 16);

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
        const direction = removeParentheses(departure.direction);
        const departureConfig = departureConfigMap.get(departure.name);

        // Check if this specific direction should be prioritized
        let isPrioritized = departureConfig?.prioritized || false;
        if (isPrioritized && departureConfig?.prioritizedDirections) {
          isPrioritized = departureConfig.prioritizedDirections.some((filter) =>
            direction.toLowerCase().includes(filter.toLowerCase()),
          );
        }

        return {
          name: departure.name,
          transportType: departure.transportType,
          time: formatClockTime(departure.time),
          timeLeft: formatTimeDifference(departure.time),
          direction,
          station: stationName,
          canceled: departure.canceled,
          delayMinutes: departure.delayMinutes,
          isRealtime: departure.isRealtime,
          config: departureConfig,
          prioritized: isPrioritized,
        };
      })
      .filter((departure) => {
        const config = departure.config;
        if (!config) return false;

        if (departure.timeLeft < 0) return false;

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
      .map(({ ...rest }) => rest);

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

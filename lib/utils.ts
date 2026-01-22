import {
  DRÄGG_START_HOUR,
  DRÄGG_END_HOUR,
  DEFAULT_MIN_TIME_THRESHOLD,
  MAX_DEPARTURES_TO_DISPLAY,
} from "@/lib/constants";
import { ApiDeparture, ProcessedDeparture, Station } from "./types";

export const getAdjustedStockholmTime = (): Date => {
  const nowInSweden = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Stockholm" }),
  );

  const currentHour = nowInSweden.getHours();

  if (currentHour >= DRÄGG_START_HOUR && currentHour <= DRÄGG_END_HOUR) {
    const minutesToSubtract = currentHour + 1;
    const adjustedTime = new Date(
      nowInSweden.getTime() - minutesToSubtract * 60 * 1000,
    );
    return adjustedTime;
  }

  return nowInSweden;
};

export const formatTimeDifference = (
  departureTime: string,
): number | string => {
  // Get adjusted time in Swedish timezone
  const nowInSweden = getAdjustedStockholmTime();

  const [hours, minutes] = departureTime.split(":").map(Number);

  const departureDate = new Date(
    nowInSweden.getFullYear(),
    nowInSweden.getMonth(),
    nowInSweden.getDate(),
    hours,
    minutes,
  );

  if (departureDate < nowInSweden) {
    departureDate.setDate(departureDate.getDate() + 1);
  }

  const differenceInMs = departureDate.getTime() - nowInSweden.getTime();

  if (differenceInMs < 0) {
    return "Departed";
  }

  const differenceInMin = Math.floor(differenceInMs / 1000 / 60);

  return differenceInMin;
};

export const removeParentheses = (input: string): string => {
  return input.replace(/\s*\(.*?\)/g, "");
};

export const formatMinutesToReadable = (minutes: number | string): string => {
  if (typeof minutes !== "number") {
    return String(minutes);
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    return `${hours} h, ${remainingMinutes} min`;
  }
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
      .map(({ config, ...rest }) => rest); // Remove config before returning

    allProcessedDepartures.push(...processedDepartures);
  });

  const allDepartures = allProcessedDepartures.sort(
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

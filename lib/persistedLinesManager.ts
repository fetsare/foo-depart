import fs from "fs";
import path from "path";
import { Station } from "./types";

const DEPARTURES_CONFIG_PATH = path.join(
  process.cwd(),
  "lib",
  "departures.json"
);

interface PersistedLine {
  name: string;
  transportType: string;
}

// Map line numbers to their transport types based on common patterns
function inferTransportType(lineName: string): string {
  // Tunnelbana (Subway) - typically single or double digit
  if (/^(1[0-9]|[1-9])$/.test(lineName)) {
    return "Tunnelbana";
  }
  // Tåg (Train) - typically 40s range
  if (/^4[0-9]$/.test(lineName)) {
    return "Tåg";
  }
  // Buss (Bus) - typically 3+ digits or contains X
  if (/^[1-9][0-9]{2,}X?$/.test(lineName)) {
    return "Buss";
  }
  // Default to Buss
  return "Buss";
}

export function getPersistedLines(): PersistedLine[] {
  try {
    const data = fs.readFileSync(DEPARTURES_CONFIG_PATH, "utf-8");
    const config: { stations: Station[] } = JSON.parse(data);
    
    const linesMap = new Map<string, PersistedLine>();
    
    config.stations.forEach((station) => {
      station.departures.forEach((departure) => {
        if (!linesMap.has(departure.line)) {
          linesMap.set(departure.line, {
            name: departure.line,
            transportType: inferTransportType(departure.line),
          });
        }
      });
    });
    
    return Array.from(linesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );
  } catch (error) {
    console.error("Failed to read departures config:", error);
    return [];
  }
}

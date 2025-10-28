import data from "@/lib/departures.json";
import {
  type Station,
  type ProcessedDeparture,
  type ApiDeparture,
} from "@/lib/types";
import { formatTimeDifference, removeParentheses } from "@/lib/utils";
import Image from "next/image";
import Clock from "@/components/Clock";

const { stations } = data as { stations: Station[] };

const RESROBOT_API_BASE_URL = process.env.RESROBOT_API_BASE_URL;
const RESROBOT_ACCESS_ID = process.env.RESROBOT_ACCESS_ID;
const API_DURATION = process.env.API_DURATION || "120";

async function fetchDepartures() {
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
            next: { revalidate: 120 },
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

const iconMap: Record<string, string> = {
  Tåg: "/pendel.svg",
  Buss: "/buss.svg",
  Tunnelbana: "/tunnelbana.svg",
};

export default async function Home() {
  const departures = await fetchDepartures();
  const minRows = 5;
  const placeholderRows = Math.max(minRows - departures.length, 0);
  const lastUpdated = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const getLineColor = (lineType: string) => {
    switch (lineType) {
      case "Tåg":
        return "bg-[#ec619f] text-white";
      case "Tunnelbana":
        return "bg-[#007db8] text-white";
      case "Buss":
        return "bg-black text-white";
      case "Spårväg":
        return "bg-[#b65f1f] text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="flex justify-center gap-10 items-center ">
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">
          Last updated: {lastUpdated}
        </p>
        <Clock />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1 sm:border-spacing-y-2 table-fixed">
          <thead>
            <tr className="text-white">
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left w-[8%]"></th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left w-[12%] text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                Line
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left w-[15%] text-xl sm:text-2xl md:text-3xl lg:text-4xl text-orange-500">
                Time
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left w-[18%] text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                Station
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left w-[25%] text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                Direction
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right w-[22%] text-xl sm:text-2xl md:text-3xl lg:text-4xl text-orange-500">
                Time Left
              </th>
            </tr>
          </thead>
          <tbody>
            {departures.map((departure, index) => {
              const nameSplit = departure.name.split(" ");
              const lineType = nameSplit[0];
              const iconSource = iconMap[lineType] || "/pendel.svg";
              const num = nameSplit[1];
              const lineColorClass = getLineColor(lineType);

              return (
                <tr
                  key={`departure-${index}`}
                  className={index % 2 !== 0 ? "bg-[#0a0a0a]" : "bg-[#141414]"}
                >
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                    <Image
                      src={iconSource}
                      alt={`${lineType} icon`}
                      width={60}
                      height={60}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16"
                    />
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                    <span
                      className={`${lineColorClass} rounded-xl sm:rounded-2xl px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl inline-block`}
                    >
                      {num}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-orange-500 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {departure.time}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {departure.station}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {departure.direction.split(" ")[0]}
                    </div>
                  </td>
                  <td
                    className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl whitespace-nowrap ${
                      (departure.timeLeft as number) <= 10
                        ? "text-red-600"
                        : "text-orange-500"
                    }`}
                  >
                    {departure.timeLeft} min
                  </td>
                </tr>
              );
            })}

            {Array.from({ length: placeholderRows }).map((_, index) => {
              const adjustedIndex = departures.length + index;
              return (
                <tr
                  key={`placeholder-${index}`}
                  className={
                    adjustedIndex % 2 !== 0 ? "bg-[#0a0a0a]" : "bg-[#141414]"
                  }
                >
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gray-800 rounded"></div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                    <div className="w-12 h-6 sm:w-16 sm:h-8 md:w-20 md:h-10 lg:w-24 lg:h-12 bg-gray-800 rounded-xl"></div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                    <div className="w-16 h-6 sm:w-20 sm:h-8 md:w-24 md:h-10 lg:w-28 lg:h-12 bg-gray-800 rounded"></div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                    <div className="w-24 h-6 sm:w-32 sm:h-8 md:w-40 md:h-10 lg:w-48 lg:h-12 bg-gray-800 rounded"></div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                    <div className="w-20 h-6 sm:w-24 sm:h-8 md:w-32 md:h-10 lg:w-40 lg:h-12 bg-gray-800 rounded"></div>
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                    <div className="w-16 h-6 sm:w-20 sm:h-8 md:w-24 md:h-10 lg:w-28 lg:h-12 bg-gray-800 rounded ml-auto"></div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

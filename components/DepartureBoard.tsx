"use client";

import { useEffect } from "react";
import { ApiDeparture, Station } from "@/lib/types";
import { formatMinutesToReadable } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Clock from "@/components/Clock";
import Link from "next/link";
import { processDepartures } from "@/lib/utils";

interface DepartureBoardProps {
  rawDepartures: {
    station: Station;
    departures: ApiDeparture[];
  }[];
}

const iconMap: Record<string, string> = {
  Tåg: "/pendel.svg",
  Buss: "/buss.svg",
  Tunnelbana: "/tunnelbana.svg",
};

const lineColorMap: Record<string, string> = {
  Tåg: "bg-[#ec619f]",
  Tunnelbana: "bg-[#007db8]",
  Buss: "bg-black",
  Spårväg: "bg-[#b65f1f]",
};

const REFRESH_INTERVAL = 30000;
const MIN_ROWS = 5;

const commonPadding =
  "px-1 sm:px-2 md:px-4 lg:px-6 py-0.5 sm:py-1 md:py-2 2xl:px-8 2xl:py-2";
const headerTextSize =
  "text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl";
const cellTextSize =
  "text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl";

const getRowBackground = (index: number) =>
  index % 2 !== 0 ? "bg-[#0a0a0a]" : "bg-[#141414]";

const getLineColor = (lineType: string) =>
  lineColorMap[lineType] || "bg-gray-500";

export default function DepartureBoard({ rawDepartures }: DepartureBoardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hideContact = searchParams.has("hideContact");
  const initialDepartures = processDepartures(rawDepartures);

  // refresh the frontend every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const placeholderRows = Math.max(MIN_ROWS - initialDepartures.length, 0);
  const lastUpdated = new Date().toLocaleTimeString("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour12: false,
  });
  return (
    <main
      className={`${
        hideContact && "cursor-none"
      } min-h-screen bg-black text-white p-4 relative`}
    >
      {!hideContact ? (
        <Link
          href={"/contact"}
          className="absolute top-4 left-4 text-sm sm:text-base md:text-lg lg:text-xl text-blue-400 focus:text-blue-500 hover:cursor-pointer hover:underline"
        >
          Contact
        </Link>
      ) : (
        <Clock />
      )}
      <div className="absolute top-4 right-4 text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">
        Ugla
      </div>
      <div className="flex justify-center gap-10 items-center ">
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">
          Last updated: {lastUpdated}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-0 sm:border-spacing-y-0.5 md:border-spacing-y-1">
          <thead>
            <tr className="text-white">
              {/* <th className={`${commonPadding} text-left`}></th> */}
              <th
                className={`${commonPadding} text-left whitespace-nowrap ${headerTextSize}`}
              >
                Line
              </th>
              <th
                className={`${commonPadding} text-left whitespace-nowrap ${headerTextSize} text-orange-500`}
              >
                Departs
              </th>
              <th
                className={`${commonPadding} text-left whitespace-nowrap ${headerTextSize} text-orange-500`}
              >
                Time
              </th>
              <th
                className={`${commonPadding} text-left w-full ${headerTextSize}`}
              >
                Station
              </th>
              <th
                className={`${commonPadding} text-right whitespace-nowrap ${headerTextSize} text-orange-500`}
              >
                Next
              </th>
            </tr>
          </thead>
          <tbody>
            {initialDepartures.map((departure, index) => {
              const lineType = departure.transportType;
              const isUrgent = (departure.timeLeft as number) <= 10;

              return (
                <tr
                  key={`departure-${index}`}
                  className={getRowBackground(index)}
                >
                  {/* <td className={commonPadding}>
                    <Image
                      src={getIcon(lineType)}
                      alt={`${lineType} icon`}
                      width={64}
                      height={64}
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 2xl:w-16 2xl:h-16"
                      style={{ width: "auto", height: "auto" }}
                    />
                  </td> */}
                  <td className={commonPadding}>
                    <span
                      className={`${getLineColor(
                        lineType,
                      )} rounded-lg sm:rounded-xl px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 2xl:px-4 2xl:py-2 2xl:rounded-2xl font-bold ${cellTextSize} inline-block`}
                    >
                      {departure.name}
                    </span>
                  </td>
                  <td
                    className={`${commonPadding} text-left font-bold ${cellTextSize} whitespace-nowrap ${
                      isUrgent ? "text-red-600" : "text-orange-500"
                    }`}
                  >
                    {formatMinutesToReadable(departure.timeLeft)}
                  </td>
                  <td
                    className={`${commonPadding} text-left text-orange-500 ${cellTextSize}`}
                  >
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {departure.time}
                    </div>
                  </td>
                  <td
                    className={`${commonPadding} text-left text-white ${cellTextSize} max-w-0`}
                  >
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {departure.station}{" "}
                      <span className="text-orange-500 mx-0.5 sm:mx-1 md:mx-2">
                        →
                      </span>{" "}
                      {departure.direction.split(" ")[0]}
                    </div>
                  </td>
                  <td
                    className={`${commonPadding} text-right text-orange-500 ${cellTextSize} whitespace-nowrap`}
                  >
                    {departure.nextDepartureTimeLeft
                      ? formatMinutesToReadable(departure.nextDepartureTimeLeft)
                      : "-"}
                  </td>
                </tr>
              );
            })}

            {Array.from({ length: placeholderRows }).map((_, index) => (
              <tr
                key={`placeholder-${index}`}
                className={getRowBackground(initialDepartures.length + index)}
              >
                <td className={commonPadding}>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 2xl:w-16 2xl:h-16 bg-gray-800 rounded"></div>
                </td>
                <td className={commonPadding}>
                  <div className="w-8 h-4 sm:w-10 sm:h-5 md:w-14 md:h-6 lg:w-16 lg:h-8 xl:w-20 xl:h-10 2xl:w-24 2xl:h-12 bg-gray-800 rounded-lg"></div>
                </td>
                <td className={commonPadding}>
                  <div className="w-12 h-4 sm:w-16 sm:h-5 md:w-20 md:h-6 lg:w-28 lg:h-8 xl:w-32 xl:h-10 2xl:w-40 2xl:h-12 bg-gray-800 rounded ml-auto"></div>
                </td>
                <td className={commonPadding}>
                  <div className="w-14 h-4 sm:w-20 sm:h-5 md:w-28 md:h-6 lg:w-36 lg:h-8 xl:w-40 xl:h-10 2xl:w-48 2xl:h-12 bg-gray-800 rounded"></div>
                </td>
                <td className={commonPadding}>
                  <div className="w-12 h-4 sm:w-14 sm:h-5 md:w-18 md:h-6 lg:w-20 lg:h-8 xl:w-24 xl:h-10 2xl:w-28 2xl:h-12 bg-gray-800 rounded"></div>
                </td>
                <td className={commonPadding}>
                  <div className="w-12 h-4 sm:w-14 sm:h-5 md:w-18 md:h-6 lg:w-20 lg:h-8 xl:w-24 xl:h-10 2xl:w-28 2xl:h-12 bg-gray-800 rounded ml-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

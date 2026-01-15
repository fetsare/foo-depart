"use client";

import { useEffect } from "react";
import { type ProcessedDeparture } from "@/lib/types";
import { formatMinutesToReadable } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Clock from "@/components/Clock";

interface DepartureBoardProps {
  initialDepartures: ProcessedDeparture[];
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

const commonPadding = "px-2 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2";
const headerTextSize = "text-xl sm:text-2xl md:text-3xl lg:text-4xl";
const cellTextSize = "text-xl sm:text-2xl md:text-3xl lg:text-4xl";

const getRowBackground = (index: number) =>
  index % 2 !== 0 ? "bg-[#0a0a0a]" : "bg-[#141414]";

const getLineColor = (lineType: string) =>
  lineColorMap[lineType] || "bg-gray-500";

const getIcon = (lineType: string) => iconMap[lineType] || "/pendel.svg";

export default function DepartureBoard({
  initialDepartures,
}: DepartureBoardProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [router]);

  const placeholderRows = Math.max(MIN_ROWS - initialDepartures.length, 0);
  const lastUpdated = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <main
      className={`${process.env.NODE_ENV} min-h-screen bg-black text-white p-4 relative`}
    >
      <div className="absolute top-4 right-4 text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">
        Ugla
      </div>
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
              <th className={`${commonPadding} text-left w-[8%]`}></th>
              <th
                className={`${commonPadding} text-left w-[10%] ${headerTextSize}`}
              >
                Line
              </th>
              <th
                className={`${commonPadding} text-left w-[13%] ${headerTextSize} text-orange-500`}
              >
                Depart
              </th>
              <th
                className={`${commonPadding} text-left w-[13%] ${headerTextSize} text-orange-500`}
              >
                Next
              </th>
              <th
                className={`${commonPadding} text-left w-[40%] ${headerTextSize}`}
              >
                Station
              </th>
              <th
                className={`${commonPadding} text-right w-[12%] ${headerTextSize} text-orange-500`}
              >
                Time
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
                  <td className={commonPadding}>
                    <Image
                      src={getIcon(lineType)}
                      alt={`${lineType} icon`}
                      width={60}
                      height={60}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16"
                    />
                  </td>
                  <td className={commonPadding}>
                    <span
                      className={`${getLineColor(
                        lineType
                      )} rounded-xl sm:rounded-2xl px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 font-bold ${cellTextSize} inline-block`}
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
                    className={`${commonPadding} text-left text-orange-500 ${cellTextSize} whitespace-nowrap`}
                  >
                    {departure.nextDepartureTimeLeft
                      ? formatMinutesToReadable(departure.nextDepartureTimeLeft)
                      : "-"}
                  </td>
                  <td
                    className={`${commonPadding} text-left text-white ${cellTextSize}`}
                  >
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {departure.station}{" "}
                      <span className="text-orange-500 mx-1 sm:mx-2">→</span>{" "}
                      {departure.direction.split(" ")[0]}
                    </div>
                  </td>
                  <td
                    className={`${commonPadding} text-right text-orange-500 ${cellTextSize}`}
                  >
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {departure.time}
                    </div>
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
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gray-800 rounded"></div>
                </td>
                <td className={commonPadding}>
                  <div className="w-12 h-6 sm:w-16 sm:h-8 md:w-20 md:h-10 lg:w-24 lg:h-12 bg-gray-800 rounded-xl"></div>
                </td>
                <td className={commonPadding}>
                  <div className="w-20 h-6 sm:w-24 sm:h-8 md:w-32 md:h-10 lg:w-40 lg:h-12 bg-gray-800 rounded ml-auto"></div>
                </td>
                <td className={commonPadding}>
                  <div className="w-16 h-6 sm:w-20 sm:h-8 md:w-24 md:h-10 lg:w-28 lg:h-12 bg-gray-800 rounded ml-auto"></div>
                </td>
                <td className={commonPadding}>
                  <div className="w-16 h-6 sm:w-20 sm:h-8 md:w-24 md:h-10 lg:w-28 lg:h-12 bg-gray-800 rounded"></div>
                </td>
                <td className={commonPadding}>
                  <div className="w-24 h-6 sm:w-32 sm:h-8 md:w-40 md:h-10 lg:w-48 lg:h-12 bg-gray-800 rounded"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

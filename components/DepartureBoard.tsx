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

export default function DepartureBoard({
  initialDepartures,
}: DepartureBoardProps) {
  const router = useRouter();

  useEffect(() => {
    // Refresh the page data every 120 seconds
    // This refetches from the server's cached data (shared across all clients)
    const interval = setInterval(() => {
      router.refresh();
    }, 120000); // 120 seconds

    return () => clearInterval(interval);
  }, [router]);

  const minRows = 5;
  const placeholderRows = Math.max(minRows - initialDepartures.length, 0);
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
    <main className="min-h-screen bg-black text-white p-4 relative">
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
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left w-[8%]"></th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left w-[12%] text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                Line
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left w-[12%] text-xl sm:text-2xl md:text-3xl lg:text-4xl text-orange-500">
                Depart
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left w-[15%] text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                Station
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left w-[20%] text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                Direction
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right w-[18%] text-xl sm:text-2xl md:text-3xl lg:text-4xl text-orange-500">
                Time Left
              </th>
              <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right w-[15%] text-xl sm:text-2xl md:text-3xl lg:text-4xl text-orange-500">
                Next
              </th>
            </tr>
          </thead>
          <tbody>
            {initialDepartures.map((departure, index) => {
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
                    {formatMinutesToReadable(departure.timeLeft)}
                  </td>
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-right text-orange-500 text-xl sm:text-2xl md:text-3xl lg:text-4xl whitespace-nowrap">
                    {departure.nextDepartureTimeLeft
                      ? formatMinutesToReadable(departure.nextDepartureTimeLeft)
                      : "-"}
                  </td>
                </tr>
              );
            })}

            {Array.from({ length: placeholderRows }).map((_, index) => {
              const adjustedIndex = initialDepartures.length + index;
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
                  </td>{" "}
                  <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                    <div className="w-16 h-6 sm:w-20 sm:h-8 md:w-24 md:h-10 lg:w-28 lg:h-12 bg-gray-800 rounded ml-auto"></div>
                  </td>{" "}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

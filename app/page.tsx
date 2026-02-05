import { Suspense } from "react";
import DepartureBoard from "@/components/DepartureBoard";
import { fetchRawDepartures } from "@/lib/actions";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { validateConfig } from "@/lib/constants";
import { getPersistedLines } from "@/lib/persistedLinesManager";

const lineColorMap: Record<string, string> = {
  Tåg: "bg-[#ec619f]",
  Tunnelbana: "bg-[#007db8]",
  Buss: "bg-black",
  Spårväg: "bg-[#b65f1f]",
};

const getLineColor = (lineType: string) =>
  lineColorMap[lineType] || "bg-gray-500";

export default async function Home() {
  validateConfig();

  const rawData = await fetchRawDepartures();
  const persistedLines = getPersistedLines();

  return (
    <>
      <SpeedInsights />
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <div className="py-1 sm:py-1.5 md:py-2 px-4 flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 justify-start items-center bg-[#0a0a0a]">
          {persistedLines.map((line) => {
            const isBlack = getLineColor(line.transportType) === "bg-black";
            return (
              <span
                key={line.name}
                className={`${getLineColor(
                  line.transportType,
                )} ${isBlack ? "border border-white" : ""} rounded px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-0.5 md:py-1 font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl inline-block text-white`}
              >
                {line.name}
              </span>
            );
          })}
          <div className="absolute top-4 right-4 text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">
            Ugla
          </div>
        </div>
        <DepartureBoard rawDepartures={rawData} />
      </Suspense>
    </>
  );
}

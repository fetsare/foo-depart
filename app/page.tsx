import { Suspense } from "react";
import DepartureBoard from "@/components/DepartureBoard";
import { fetchRawDepartures } from "@/lib/actions";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { validateConfig } from "@/lib/constants";

export default async function Home() {
  validateConfig();

  const rawData = await fetchRawDepartures();

  return (
    <>
      <SpeedInsights />
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <DepartureBoard rawDepartures={rawData} />
      </Suspense>
      <div className="absolute right-2 bottom-2 text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">
        Ugla
      </div>
    </>
  );
}

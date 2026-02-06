import { Suspense } from "react";
import DepartureBoard from "@/components/DepartureBoard";
import Contributors from "@/components/Contributors";
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
      <Contributors />
    </>
  );
}

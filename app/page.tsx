import { Suspense } from "react";
import DepartureBoard from "@/components/DepartureBoard";
import { fetchDepartures } from "@/lib/actions";

// Force dynamic rendering - no page-level caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const initialDepartures = await fetchDepartures();

  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <DepartureBoard initialDepartures={initialDepartures} />
    </Suspense>
  );
}

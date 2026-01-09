import DepartureBoard from "@/components/DepartureBoard";
import { fetchDepartures } from "@/lib/actions";

// Revalidate every 10 minutes - all users will share the same data
// Client will refresh every 30 sec but with same data
export const revalidate = 600000;

export default async function Home() {
  const initialDepartures = await fetchDepartures();

  return <DepartureBoard initialDepartures={initialDepartures} />;
}

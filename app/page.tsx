import DepartureBoard from "@/components/DepartureBoard";
import { fetchDepartures } from "@/lib/actions";

// Revalidate every 5 minutes - all users will share the same data
export const revalidate = 300000;

export default async function Home() {
  const initialDepartures = await fetchDepartures();

  return <DepartureBoard initialDepartures={initialDepartures} />;
}

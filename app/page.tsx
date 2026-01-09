import DepartureBoard from "@/components/DepartureBoard";
import { fetchDepartures } from "@/lib/actions";

// Revalidate every 120 seconds - all users will share the same data
export const revalidate = 120;

export default async function Home() {
  const initialDepartures = await fetchDepartures();

  return <DepartureBoard initialDepartures={initialDepartures} />;
}

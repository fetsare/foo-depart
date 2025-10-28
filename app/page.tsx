import DepartureBoard from "@/components/DepartureBoard";
import { fetchDepartures } from "@/lib/actions";

export default async function Home() {
  const initialDepartures = await fetchDepartures();

  return <DepartureBoard initialDepartures={initialDepartures} />;
}

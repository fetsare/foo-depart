export interface DepartureConfig {
  line: string;
  directions?: string[];
  minTimeThreshold?: number;
  prioritized?: boolean;
}

export interface Station {
  name: string;
  id: number;
  departures: DepartureConfig[];
}

export interface ProcessedDeparture {
  name: string;
  transportType: string;
  time: string;
  timeLeft: number | string;
  direction: string;
  station: string;
  nextDepartureTimeLeft?: number;
  prioritized?: boolean;
}

export interface ApiDeparture {
  name: string;
  time: string;
  direction: string;
}

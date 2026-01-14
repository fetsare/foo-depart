export interface Station {
  name: string;
  id: number;
  allowedDepartures: string[];
  minTimeThresholds?: Record<string, number>;
}

export interface ProcessedDeparture {
  name: string;
  transportType: string;
  time: string;
  timeLeft: number | string;
  direction: string;
  station: string;
  nextDepartureTimeLeft?: number;
}

export interface ApiDeparture {
  name: string;
  time: string;
  direction: string;
}

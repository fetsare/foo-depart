export interface Station {
  name: string;
  id: number;
  allowedDepartures: string[];
}

export interface ProcessedDeparture {
  name: string;
  time: string;
  timeLeft: number | string;
  direction: string;
  station: string;
}

export interface ApiDeparture {
  name: string;
  time: string;
  direction: string;
}

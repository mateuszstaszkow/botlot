// TODO: move to model directory and split between files, add responses etc.

export interface Weekend {
  friday: string;
  sunday: string;
  isLast?: boolean;
}

export interface Flight {
  cost: string;
  coordinates: [number, number];
  arrival: Airport;
  depart: Airport;
  weekend: Weekend;
  isRound: boolean;
  summary?: number;
  hotel?: Hotel;
  invocations?: number; // TODO: remove
}

export interface Airport {
  startId?: string;
  endId?: string;
  city: string;
  country: string;
  airline?: string;
  coordinates?: [number, number];
  startDistance?: number;
  endDistance?: number;
}

export interface Hotel {
  name: string;
  cost: number;
  coordinates: [number, number];
}

export interface DetailedAirport {
  id: string;
  name: string;
  coordinates: number[];
}

export interface DetailedFlightAirports {
  start: DetailedAirport;
  end: DetailedAirport;
}

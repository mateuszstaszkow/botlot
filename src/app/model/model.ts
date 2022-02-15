// TODO: move to model directory and split between files, add responses etc.

export interface Weekend {
  startDay: string;
  endDay: string;
  startHourFrom: number;
  startHourTo: number;
  endHourFrom: number;
  endHourTo: number;
  isLast?: boolean;
}

export interface Flight {
  cost: number;
  coordinates: [number, number];
  arrival: Airport;
  depart: Airport;
  weekend: Weekend;
  isRound: boolean;
  summary?: number;
  hotel?: Hotel;
  invocations?: number;
  detailedFlight?: DetailedFlightAirports;
  start?: CityCodeDto;
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
  startTaxiCost?: number;
  endTaxiCost?: number;
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

export interface CityCodeDto {
  code: string;
  city: string;
  country?: string;
  geocode: number[];
}

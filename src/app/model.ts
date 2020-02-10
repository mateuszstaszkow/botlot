// TODO: move to model directory and split between files, add responses etc.

export interface Weekend {
  friday: string;
  sunday: string;
  isLast?: boolean;
}

export interface Flight {
  id: string;
  cost: string;
  airline: string;
  arrival: Airport;
  depart: Airport;
  weekend: Weekend;
  isRound: boolean;
  summary?: number;
  hotel?: Hotel;
  invocations?: number; // TODO: remove
}

export interface Airport {
  city: string;
  country: string;
}

export interface Hotel {
  name: string;
  cost: number;
}

import {Component, OnInit} from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {concatMap, delay} from 'rxjs/operators';
import {DetailedFlightAirports, Flight, Hotel, Weekend} from './model';
import {
  CHOPIN_BODY,
  GOOGLE_FLIGHTS_OPTIONS,
  GOOGLE_FLIGHTS_URL,
  HOLIDAY_BODY,
  TRIVAGO_ALL_INCUSIVE,
  TRIVAGO_BODY,
  TRIVAGO_GRAPHQL_URL,
  TRIVAGO_HOLIDAY_QUERY_PARAMS,
  TRIVAGO_LOW_COST,
  TRIVAGO_OPTIONS,
  TRIVAGO_QUERY_PARAMS,
  TRIVAGO_SUGGESTIONS_BODY,
  TRIVAGO_SUGGESTIONS_OPTIONS,
  TRIVAGO_SUGGESTIONS_URL,
  WARSAW_BODY
} from './app-paths';
import {DetailedFlightService} from './detailed-flight.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'botlot';
  public currentFlights = 0;
  public readonly requestDebounce = 1000;
  private readonly HOME_COORDINATES = [20.979214, 52.231975];
  private readonly HOTEL_MAX_DISTANCE_TO_CENTER = 3;
  private readonly DECIMAL_DEGREE_TO_KM = 111.196672;
  private readonly WIZZ_DISCOUNT_PLN = 43;
  private readonly WIZZ_MIN_PRICE = 78;
  private readonly maxMinuteDistanceForCloseFlights = 2.5;
  private FLIGHT_COST_MAX = 800;
  private HOTEL_COST_MAX = 1000;
  private readonly startingDay = 5;
  private readonly endingDay = 7;
  private startingHour = 14;
  private endingHour = 10;
  private body; // TODO: remove
  private trivagoQueryParams = TRIVAGO_QUERY_PARAMS; // TODO: remove
  private readonly bannedCountries = [
    'Poland',
    // 'United Kingdom',
    'Ukraine',
    'Germany',
    'Portugal',
    'Belgium',
    'Hungary',
    'Austria',
    'Greece',
    'Latvia',
    'Slovakia',
    'Romania',
    'Moldova',
    'Morocco',
    'France',
    'United Arab Emirates'
  ];
  private readonly bannedCities = [
    'London'
    // 'Kanton',
    // 'Nowe Delhi',
    // 'Hongkong',
    // 'Bangkok',
    // 'Tajpej',
  ];
  private flights: Flight[] = [];
  private flightDetailsLoading = false;

  constructor(private readonly detailedFlightService: DetailedFlightService) { }

  ngOnInit(): void {
    this.body = WARSAW_BODY;
    const weekends = this.buildRemainingWeekends();
    weekends[weekends.length - 1].isLast = true;
    this.mapToDelayedObservableArray(weekends)
      .subscribe((weekend: Weekend) => {
        this.body[3][13][0][6] = weekend.friday;
        this.body[3][13][1][6] = weekend.sunday;
        if (this.body[3][13][0][2]) {
          this.body[3][13][0][2][0] = this.startingHour;
          this.body[3][13][1][2][0] = this.endingHour;
        }
        this.getFlights(weekend);
      });
  }

  public sortFlights() {
    this.flights.sort((a, b) => this.sortBySummary(a, b));
  }

  public getProgress(): number {
    if (!this.flights.length) {
      return 0;
    }
    return Math.round(this.currentFlights / this.flights.length * 100);
  }

  private mapToDelayedObservableArray<T>(objects: T[]): Observable<T | T[]> {
    return from(objects).pipe(
      concatMap(weekend => {
        const noisyDebounce = this.requestDebounce + (100 - Math.floor(Math.random() * 200));
        return of(weekend).pipe(
          delay(noisyDebounce)
        );
      })
    );
  }

  // TODO implement
  private getFlights(weekend: Weekend) {
    this.getRoundFlights(weekend);
    // if (this.body === CHOPIN_BODY || this.body === WARSAW_BODY) {
    //   this.getOneWayFlights(weekend);
    // }
  }

  // TODO implement
  private getOneWayFlights(weekend: Weekend, flightId?) {
    const options = this.buildOneWayFlightOptions();
    fetch(GOOGLE_FLIGHTS_URL, options)
      .then(response => response.json())
      .then(response => this.buildFlights(weekend, response))
      .then(flights => this.mapToDelayedObservableArray(flights)
        .subscribe((flight: Flight) => this.appendOneWayFlight(flight, weekend)))
      // .catch(error => {
      //   this.flights[this.flights.length - 1].weekend.isLast = true;
      //   this.sendRoundFlights();
      // });
  }

  private appendOneWayFlight(flight: Flight, weekend: Weekend): void {
    const options = this.buildOneWayFlightOptions(flight.arrival.endId);
    fetch(GOOGLE_FLIGHTS_URL, options)
      .then(response => response.json())
      .then(response => this.buildFlights(weekend, response)
        .find(f => f.arrival.endId === flight.arrival.endId))
      .then(returnFlight => console.log(returnFlight));
  }

  private buildOneWayFlightOptions(flightId?) {
    const body = [ ...this.body ];
    const airports = [ ...this.body[3] ];
    const directionId = flightId ? 0 : 1;
    airports[13] = [ ...this.body[3][13] ];
    airports[13].splice(directionId, 1);
    if (flightId) {
      airports[13][0][0] = [[[ flightId, 4 ]]]; // TODO: what is 4?
      airports[13][0][1] = null; // TODO: what is 4?
    }
    body[3] = airports;
    return { ...GOOGLE_FLIGHTS_OPTIONS, body: JSON.stringify(body) };
  }

  private getRoundFlights(weekend: Weekend) {
    const options = { ...GOOGLE_FLIGHTS_OPTIONS, body: JSON.stringify(this.body) };
    fetch(GOOGLE_FLIGHTS_URL, options)
      .then(response => response.json())
      .then(response => this.appendRoundFlight(weekend, response))
      .catch(error => {
        this.flights[this.flights.length - 1].weekend.isLast = true;
        this.sendRoundFlights();
      });
  }

  // TODO: implement one way
  private buildFlights(weekend: Weekend, response): Flight[] {
    return response[0][1][4][0]
      .filter(flightResponse => +flightResponse[1][0][1] < this.FLIGHT_COST_MAX)
      .map((flightResponse): Flight => {
        const destination = response[0][0][3][0].find(d => d[0] === flightResponse[0]);
        let cost = flightResponse[1][0][1];
        const airline = flightResponse[6][1];
        const homeId = this.body[3][13][0][0][0][0][0];
        if (airline === 'Wizz Air') {
          cost = cost - this.WIZZ_DISCOUNT_PLN;
          cost = cost < this.WIZZ_MIN_PRICE ? this.WIZZ_MIN_PRICE : cost;
        }
        return {
          cost: cost + ' zł',
          coordinates: [destination[1][1], destination[1][0]],
          arrival: {
            startId: homeId,
            endId: flightResponse[0],
            city: destination[2],
            country: destination[4],
            airline,
          },
          depart: {
            startId: flightResponse[0],
            endId: homeId,
            city: destination[2],
            country: destination[4],
            airline,
          },
          isRound: true,
          weekend
        };
      });
  }

  private appendRoundFlight(weekend: Weekend, response): void {
    const properFlights = this.buildFlights(weekend, response)
      .filter((flight: Flight) => !this.isAirportBanned(flight));
    this.flights = this.flights.concat(properFlights);
    if (weekend.isLast) {
      this.sendRoundFlights();
    }
  }

  private isAirportBanned(flight: Flight): boolean {
    return this.bannedCountries.includes(flight.arrival.country)
      || this.bannedCities.includes(flight.arrival.city)
      || this.bannedCountries.includes(flight.depart.country)
      || this.bannedCities.includes(flight.depart.city);
  }

  private sendRoundFlights() {
    this.flights.forEach(flight => this.setHotelForRoundFlight(flight));
  }

  private setHotelForRoundFlight(flight: Flight) {
    const queryParams = { ...this.trivagoQueryParams };
    const body = { ...TRIVAGO_BODY, variables: { ...TRIVAGO_BODY.variables } };
    const options = { ...TRIVAGO_OPTIONS };
    flight.invocations = 0;
    this.getTrivagoCityCode(flight.arrival.city)
      .then(code => {
        queryParams.uiv = code;
        queryParams.sp = this.mapToTrivagoDate(flight.weekend.friday) + '/' + this.mapToTrivagoDate(flight.weekend.sunday);
        body.variables.queryParams = <any>JSON.stringify(queryParams);
        options.body = JSON.stringify(body);
        this.fetchHotelAndAssignForRoundFlight(flight, options, body, queryParams);
      });
  }

  private fetchHotelAndAssignForRoundFlight(flight, options, body, queryParams) {
    flight.invocations++;
    fetch(TRIVAGO_GRAPHQL_URL, options)
      .then(response => response.json())
      .then(response => {
        const hotel = response.data.rs.accommodations.find(a => this.isNotHostelAndDistantAndExpensive(flight, a));
        if (hotel) {
          this.assignHotelToRoundFlight(flight, hotel);
          if (flight.weekend.isLast) {
            this.updateFlightsWithAirportCoordinates();
          }
          return;
        } else if (response.data.rs.accommodations.length) {
          queryParams.accoff += 25;
          body.variables.queryParams = <any>JSON.stringify(queryParams);
          options.body = JSON.stringify(body);
          this.fetchHotelAndAssignForRoundFlight(flight, options, body, queryParams);
        } else if (flight.invocations > 3) {
          const index = this.flights.indexOf(flight);
          if (index !== -1) {
            this.flights.splice(index, 1);
          }
          if (flight.weekend.isLast) {
            this.updateFlightsWithAirportCoordinates();
          }
          return;
        }
        this.fetchHotelAndAssignForRoundFlight(flight, options, body, queryParams);
      })
      .catch(error => this.updateFlightsWithAirportCoordinates());
  }

  private updateFlightsWithAirportCoordinates(): void {
    if (this.currentFlights) {
      return;
    }
    this.currentFlights++;
    this.mapToDelayedObservableArray(this.flights)
      .subscribe((flight: Flight) => this.detailedFlightService
          .getDetailedFlightInfo(flight, String(this.startingHour), String(this.endingHour))
          .pipe(
            delay(this.requestDebounce)
          ).subscribe(detailedFlight => this.calculateSummaryWithShuttle(flight, detailedFlight))
        );
  }

  private calculateSummaryWithShuttle(flight: Flight, detailedFlight: DetailedFlightAirports): void {
    const rms = +this.trivagoQueryParams.rms;
    if (flight.hotel) {
      flight.arrival.endDistance = Math.round(this
        .calculateStraightDistanceInKilometers(detailedFlight.end.coordinates, flight.hotel.coordinates));
    } else {
      flight.arrival.endDistance = 0; // TODO: fix
    }
    flight.arrival.startDistance = Math.round(this
      .calculateStraightDistanceInKilometers(detailedFlight.start.coordinates, this.HOME_COORDINATES));
    flight.summary += (flight.arrival.endDistance + flight.arrival.startDistance) * 2.5 / rms; // TODO: implement Uber
    if (++this.currentFlights === this.flights.length + 1) {
      this.sortFlights();
      this.flightDetailsLoading = false;
    }
  }

  private isNotHostelAndDistantAndExpensive(flight: Flight, accommodation): boolean {
    return !accommodation.accommodationType.value.includes('Hostel')
      && !this.isHotelExpensive(accommodation)
      && this.calculateStraightDistanceInKilometers(
        flight.coordinates,
        [accommodation.geocode.lng, accommodation.geocode.lat]
      ) < this.HOTEL_MAX_DISTANCE_TO_CENTER;
  }

  private isHotelExpensive(hotel): boolean {
    return hotel.deals.bestPrice.pricePerStay > this.HOTEL_COST_MAX;
  }

  private assignHotelToRoundFlight(flight: Flight, hotel) {
    const cost = hotel.deals.bestPrice.pricePerStay;
    const rms = +this.trivagoQueryParams.rms;
    const hotelData: Hotel = {
      name: hotel.name.value,
      cost: cost / rms,
      coordinates: [hotel.geocode.lng, hotel.geocode.lat]
    };
    flight.summary = +flight.cost.split(' ')[0] + hotelData.cost;
    flight.hotel = hotelData;
  }

  private calculateStraightDistanceInKilometers(first: [number, number] | number[], second: [number, number] | number[]): number {
    const x2 = Math.pow(first[0] - second[0], 2);
    const y2 = Math.pow(first[1] - second[1], 2);
    return Math.sqrt(x2 + y2) * this.DECIMAL_DEGREE_TO_KM;
  }

  private sortBySummary(a, b): number {
    if (a.summary > b.summary) {
      return 1;
    } else if (a.summary < b.summary) {
      return -1;
    }
    return 0;
  }

  private buildRemainingWeekends(long = false): Weekend[] {
    if (this.body === HOLIDAY_BODY) {
      // tslint:disable-next-line:no-shadowed-variable
      const today = new Date();
      // tslint:disable-next-line:no-shadowed-variable
      const weekends: Weekend[] = [];
      this.startingHour = 0;
      this.endingHour = 24;
      this.FLIGHT_COST_MAX = 3000;
      this.HOTEL_COST_MAX = 3000;
      this.trivagoQueryParams = TRIVAGO_HOLIDAY_QUERY_PARAMS;
      let firstDay = this.getNextDayOfWeek(today, 6);
      let lastDay = this.getNextDayOfWeek(this.getNextDayOfWeek(firstDay, 1), 7);
      while (lastDay.getFullYear() === today.getFullYear()) {
        weekends.push({
          friday: this.mapToISOStringDate(firstDay),
          sunday: this.mapToISOStringDate(lastDay)
        });
        firstDay = this.getNextDayOfWeek(lastDay, 6);
        lastDay = this.getNextDayOfWeek(this.getNextDayOfWeek(firstDay, 1), 7);
      }
      return weekends;
    }
    const today = new Date('2020-05-07');
    const weekends: Weekend[] = [];
    let friday = this.getNextDayOfWeek(today, this.startingDay);
    let sunday = this.getNextDayOfWeek(friday, this.endingDay);
    while (sunday.getDay() < 31 && sunday.getMonth() === 4) {
    //   const today = new Date();
    //   const weekends: Weekend[] = [];
    //   let friday = this.getNextDayOfWeek(today, this.startingDay);
    //   let sunday = this.getNextDayOfWeek(friday, this.endingDay);
    //   while (sunday.getFullYear() === today.getFullYear()) {
      weekends.push({
        friday: this.mapToISOStringDate(friday),
        sunday: this.mapToISOStringDate(sunday)
      });
      friday = this.getNextDayOfWeek(sunday, this.startingDay);
      sunday = this.getNextDayOfWeek(friday, this.endingDay);
    }
    return weekends;
  }

  private mapToTrivagoDate(date: string): string {
    return date
      .replace(/-/g, '');
  }

  private mapToISOStringDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getNextDayOfWeek(date, dayOfWeek): Date {
    if (dayOfWeek < 0 || dayOfWeek > 7) {
      return date;
    }
    const resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return resultDate;
  }

  private getTrivagoCityCode(name: string): Promise<string> {
    const body = {...TRIVAGO_SUGGESTIONS_BODY, query: name};
    const options = {...TRIVAGO_SUGGESTIONS_OPTIONS};
    options.body = JSON.stringify(body);
    return fetch(TRIVAGO_SUGGESTIONS_URL, options)
      .then(response => response.json())
      .then(response => {
        const qualityCodes = (this.body === HOLIDAY_BODY)
          ? TRIVAGO_ALL_INCUSIVE
          : TRIVAGO_LOW_COST;
        return response.data.suggestions[0] + qualityCodes;
      });
  }
}

// TODO remove
export function sleeper(ms) {
  return function(x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

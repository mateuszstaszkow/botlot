import {Component, OnInit} from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {concatMap, delay} from 'rxjs/operators';
import {DetailedFlightAirports, Flight, Hotel, Weekend} from './model';
import {
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
import {TaxiFareService} from './taxi-fare/taxi-fare.service';
import {TaxiFareResponseDto} from './taxi-fare/taxi-fare-response.dto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'botlot';
  public currentFlights = 0;
  public taxiRequestTime = 0;
  public distinctCities: string[];
  public readonly requestDebounce = 500;
  private readonly MS_PER_DAY = 1000 * 3600 * 24;
  private readonly TAXI_REQUEST_DEBOUNCE = 500;
  private readonly WARSAW_TAXI_RATE_PER_KM = 2.4; // TODO: fetch
  private readonly WARSAW_TAXI_STARTING_COST = 8; // TODO: fetch
  private readonly HOME_COORDINATES = [20.979214, 52.231975];
  private readonly HOTEL_MAX_DISTANCE_TO_CENTER = 3;
  private readonly DECIMAL_DEGREE_TO_KM = 111.196672;
  private readonly DISTANCE_THRESHOLD = 20;
  private readonly WIZZ_DISCOUNT_PLN = 43;
  private readonly WIZZ_MIN_PRICE = 78;
  private readonly maxMinuteDistanceForCloseFlights = 2.5;
  private FLIGHT_COST_MAX = 800;
  private HOTEL_COST_MAX = 1000;
  private readonly startingDay = 5;
  private readonly endingDay = 0;
  private fridayStartFrom = 17;
  private fridayStartTo = 23;
  private sundayStartFrom = 10;
  private sundayStartTo = 23;
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
    'London',
    'Birmingham',
    'Manchester'
  ];
  private flights: Flight[] = [];
  private flightDetailsLoading = false;

  constructor(private readonly detailedFlightService: DetailedFlightService,
              private readonly taxiFareService: TaxiFareService
  ) { }

  ngOnInit(): void {
    this.body = WARSAW_BODY;
    const weekends = this.buildRemainingWeekends();
    weekends[weekends.length - 1].isLast = true;
    this.mapToDelayedObservableArray(weekends)
      .subscribe((weekend: Weekend) => {
        this.body[3][13][0][6] = weekend.startDay;
        this.body[3][13][1][6] = weekend.endDay;
        this.body[3][13][0][2] = [weekend.startHourFrom, weekend.startHourTo];
        this.body[3][13][1][2] = [weekend.endHourFrom, weekend.endHourTo];
        this.getFlights(weekend);
      });
  }

  public sortFlightsByTotalAndFixMissingData() {
    this.fixMissingFlightsData();
    this.flights.sort((a, b) => this.sortBySummary(a, b));
  }

  public sortFlightsByPricePerDayAndFixMissingData() {
    this.fixMissingFlightsData();
    this.flights.sort((a, b) => this.sortBySummaryPerDay(a, b));
  }

  public sortFlightsByFlightCostAndFixMissingData() {
    this.fixMissingFlightsData();
    this.flights.sort((a, b) => this.sortByFlightCost(a, b));
  }

  public getProgress(): number {
    if (!this.flights.length) {
      return 0;
    }
    return Math.round(this.currentFlights / this.flights.length * 100);
  }

  public getTaxiProgress(): number {
    if (!this.distinctCities || !this.distinctCities.length) {
      return 0;
    }
    return Math.round(this.taxiRequestTime / this.distinctCities.length / this.TAXI_REQUEST_DEBOUNCE * 100000);
  }

  public getPricePerDay(flight: Flight): number {
    const endTimeStamp = new Date(flight.weekend.endDay).getTime();
    const startTimeStamp = new Date(flight.weekend.startDay).getTime();
    const numberOfDays = (endTimeStamp - startTimeStamp) / this.MS_PER_DAY;
    return Math.round(flight.summary / numberOfDays);
  }

  public getDayName(flight: Flight): string {
    const dayNo = new Date(flight.weekend.startDay).getDay();
    if (dayNo === 1) {
      return 'Monday';
    } else if (dayNo === 5) {
      return 'Friday';
    } else if (dayNo === 6) {
      return 'Saturday';
    } else if (dayNo === 7) {
      return 'Sunday';
    }
  }

  private fixMissingFlightsData(): void {
    this.flights.filter(f => f.hotel && (!f.arrival.endTaxiCost || !f.arrival.startTaxiCost))
      .forEach(errorFlight => {
        const similarFlight = this.flights.find(f => !!f.arrival.startTaxiCost
          && !!f.hotel
          && f.hotel.name === errorFlight.hotel.name
          && f.arrival.city === errorFlight.arrival.city);
        if (!similarFlight) {
          return;
        }
        errorFlight.arrival.startDistance = similarFlight.arrival.startDistance;
        errorFlight.arrival.endDistance = similarFlight.arrival.endDistance;
        errorFlight.arrival.startTaxiCost = similarFlight.arrival.startTaxiCost;
        errorFlight.arrival.endTaxiCost = similarFlight.arrival.endTaxiCost;
        errorFlight.summary += (errorFlight.arrival.startTaxiCost + errorFlight.arrival.endTaxiCost);
      });
  }

  private mapToDelayedObservableArray<T>(elements: T[]): Observable<T | T[]> {
    return from(elements).pipe(
      concatMap(element => {
        const noisyDebounce = this.requestDebounce + (100 - Math.floor(Math.random() * 200));
        return of(element).pipe(
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
      airports[13][0][1] = null;
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
            startDistance: 0,
            endDistance: 0,
            airline,
          },
          depart: {
            startId: flightResponse[0],
            endId: homeId,
            city: destination[2],
            country: destination[4],
            startDistance: 0,
            endDistance: 0,
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
        queryParams.sp = this.mapToTrivagoDate(flight.weekend.startDay) + '/' + this.mapToTrivagoDate(flight.weekend.endDay);
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
          .getDetailedFlightInfo(flight)
          .subscribe(body => {
            const flights = body[2][2][0];
            const airports = body[3][0];
            if (!flights) {
              // TODO: retry query
              this.currentFlights++;
              flight.arrival.endDistance = 0;
              flight.arrival.startDistance = 0;
              return;
            }
            const cheapestFlight = flights[0][0][4];
            const lastCheapestFlight = cheapestFlight[cheapestFlight.length - 1];
            const cheapestStart = airports.find(airport => airport[0] === cheapestFlight[0][0]);
            const cheapestEnd = airports.find(airport => airport[0] === lastCheapestFlight[1]);
            const detailedFlight = {
              start: {
                id: cheapestStart[0],
                name: cheapestStart[1],
                coordinates: [cheapestStart[12], cheapestStart[11]]
              },
              end: {
                id: cheapestEnd[0],
                name: cheapestEnd[1],
                coordinates: [cheapestEnd[12], cheapestEnd[11]]
              }
            };
            this.calculateSummaryWithShuttle(flight, detailedFlight, flights);
          })
        );
  }

  private calculateSummaryWithShuttle(flight: Flight, detailedFlight: DetailedFlightAirports, flights: any): void {
    if (flight.hotel) {
      flight.arrival.endDistance = Math.round(this
        .calculateStraightDistanceInKilometers(detailedFlight.end.coordinates, flight.hotel.coordinates));
    } else {
      flight.arrival.endDistance = 0; // TODO: fix
    }
    flight.arrival.startDistance = Math.round(this
      .calculateStraightDistanceInKilometers(detailedFlight.start.coordinates, this.HOME_COORDINATES));
    // TODO: calculate taxi cost for single case - not so important
    if (flight.arrival.startDistance > this.DISTANCE_THRESHOLD || flight.arrival.endDistance > this.DISTANCE_THRESHOLD) {
      // TODO calculate
    }
    if (++this.currentFlights === this.flights.length + 1) {
      const taxiProgressIntervalDelay = 100;
      const id = setInterval(() => {
        this.taxiRequestTime += taxiProgressIntervalDelay / 1000;
        if (this.taxiRequestTime > this.distinctCities.length) {
          clearInterval(id);
        }
      }, taxiProgressIntervalDelay);
      const cities = this.flights.map(f => f.arrival.city); // TODO: implement one way
      this.distinctCities = Array.from(new Set(cities));
      this.taxiFareService.getTaxiFaresForCities(this.distinctCities)
        .subscribe(response => {
          this.flights.filter(f => f.hotel && f.arrival.endDistance && f.arrival.startDistance)
            .forEach(f => f.summary += this.setTaxiCostsAndCalculateTaxiSummary(f, response));
          this.sortFlightsByTotalAndFixMissingData();
          this.flightDetailsLoading = false;
        });
    }
  }

  private setTaxiCostsAndCalculateTaxiSummary(flight: Flight, fareResponseDto: TaxiFareResponseDto): number {
    const rms = +this.trivagoQueryParams.rms;
    const fare = fareResponseDto.faresByCities[flight.arrival.city];
    flight.arrival.startTaxiCost = Math
      .round((flight.arrival.startDistance * this.WARSAW_TAXI_RATE_PER_KM + this.WARSAW_TAXI_STARTING_COST) / rms);
    flight.arrival.endTaxiCost = Math
      .round((flight.arrival.endDistance * fare.costPerKilometer.mean + fare.startingCost.mean) / rms);
    return flight.arrival.startTaxiCost + flight.arrival.endTaxiCost;
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
    const rms = +this.trivagoQueryParams.rms;
    return hotel.deals.bestPrice.pricePerStay > (this.HOTEL_COST_MAX * rms);
  }

  private assignHotelToRoundFlight(flight: Flight, hotel) {
    const cost = hotel.deals.bestPrice.pricePerStay;
    const rms = +this.trivagoQueryParams.rms;
    const hotelData: Hotel = {
      name: hotel.name.value,
      cost: Math.round(cost / rms),
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

  private sortBySummary(a: Flight, b: Flight): number {
    if (a.summary > b.summary) {
      return 1;
    } else if (a.summary < b.summary) {
      return -1;
    }
    return 0;
  }

  private sortBySummaryPerDay(a: Flight, b: Flight): number {
    const aPrice = this.getPricePerDay(a);
    const bPrice = this.getPricePerDay(b);
    if (aPrice > bPrice) {
      return 1;
    } else if (aPrice < bPrice) {
      return -1;
    }
    return 0;
  }

  private sortByFlightCost(a: Flight, b: Flight): number {
    const aPrice = a.cost;
    const bPrice = b.cost;
    if (aPrice > bPrice) {
      return 1;
    } else if (aPrice < bPrice) {
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
      this.fridayStartFrom = 0;
      this.sundayStartFrom = 24;
      this.FLIGHT_COST_MAX = 3000;
      this.HOTEL_COST_MAX = 3000;
      this.trivagoQueryParams = TRIVAGO_HOLIDAY_QUERY_PARAMS;
      let firstDay = this.getNextDayOfWeek(today, 6);
      let lastDay = this.getNextDayOfWeek(this.getNextDayOfWeek(firstDay, 1), 7);
      while (lastDay.getFullYear() === today.getFullYear()) {
        weekends.push({
          startDay: this.mapToISOStringDate(firstDay),
          endDay: this.mapToISOStringDate(lastDay),
          startHourFrom: this.fridayStartFrom,
          startHourTo: this.fridayStartTo,
          endHourFrom: this.sundayStartFrom,
          endHourTo: this.sundayStartTo
        });
        firstDay = this.getNextDayOfWeek(lastDay, 6);
        lastDay = this.getNextDayOfWeek(this.getNextDayOfWeek(firstDay, 1), 7);
      }
      return weekends;
    }
    // const today = new Date('2020-07-01');
    // const weekends: Weekend[] = [];
    // let friday = this.getNextDayOfWeek(today, this.startingDay);
    // let sunday = this.getNextDayOfWeek(friday, this.endingDay);
    // while (sunday.getDate() < 7 && sunday.getMonth() === 6) {
      const today = new Date();
      today.setHours(11);
      const weekends: Weekend[] = [];
      let friday = this.getNextDayOfWeek(today, this.startingDay);
      let sunday = this.getNextDayOfWeek(friday, this.endingDay);
      while (sunday.getFullYear() === today.getFullYear()) {
      weekends.push({
        startDay: this.mapToISOStringDate(friday),
        endDay: this.mapToISOStringDate(sunday),
        startHourFrom: this.fridayStartFrom,
        startHourTo: this.fridayStartTo,
        endHourFrom: this.sundayStartFrom,
        endHourTo: this.sundayStartTo
      });
      friday = this.getNextDayOfWeek(sunday, this.startingDay);
      sunday = this.getNextDayOfWeek(friday, this.endingDay);
    }
    // return weekends;
    return [
      {startDay: '2020-04-03', endDay: '2020-04-05', startHourFrom: 17, startHourTo: 23, endHourFrom: 10, endHourTo: 23 },
      {startDay: '2020-04-04', endDay: '2020-04-05', startHourFrom: 7, startHourTo: 13, endHourFrom: 20, endHourTo: 23 },
      {startDay: '2020-04-03', endDay: '2020-04-06', startHourFrom: 17, startHourTo: 23, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-04-04', endDay: '2020-04-06', startHourFrom: 7, startHourTo: 13, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-05-08', endDay: '2020-05-10', startHourFrom: 17, startHourTo: 23, endHourFrom: 10, endHourTo: 23 },
      {startDay: '2020-05-09', endDay: '2020-05-10', startHourFrom: 7, startHourTo: 13, endHourFrom: 20, endHourTo: 23 },
      {startDay: '2020-05-08', endDay: '2020-05-11', startHourFrom: 17, startHourTo: 23, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-05-09', endDay: '2020-05-11', startHourFrom: 7, startHourTo: 13, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-06-26', endDay: '2020-06-28', startHourFrom: 17, startHourTo: 23, endHourFrom: 10, endHourTo: 23 },
      {startDay: '2020-06-27', endDay: '2020-06-28', startHourFrom: 7, startHourTo: 13, endHourFrom: 20, endHourTo: 23 },
      {startDay: '2020-06-26', endDay: '2020-06-29', startHourFrom: 17, startHourTo: 23, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-06-27', endDay: '2020-06-29', startHourFrom: 7, startHourTo: 13, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-07-03', endDay: '2020-07-05', startHourFrom: 17, startHourTo: 23, endHourFrom: 10, endHourTo: 23 },
      {startDay: '2020-07-04', endDay: '2020-07-05', startHourFrom: 7, startHourTo: 13, endHourFrom: 20, endHourTo: 23 },
      {startDay: '2020-07-03', endDay: '2020-07-06', startHourFrom: 17, startHourTo: 23, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-07-04', endDay: '2020-07-06', startHourFrom: 7, startHourTo: 13, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-07-10', endDay: '2020-07-12', startHourFrom: 17, startHourTo: 23, endHourFrom: 10, endHourTo: 23 },
      {startDay: '2020-07-11', endDay: '2020-07-12', startHourFrom: 7, startHourTo: 13, endHourFrom: 20, endHourTo: 23 },
      {startDay: '2020-07-10', endDay: '2020-07-13', startHourFrom: 17, startHourTo: 23, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-07-11', endDay: '2020-07-13', startHourFrom: 7, startHourTo: 13, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-07-17', endDay: '2020-07-19', startHourFrom: 17, startHourTo: 23, endHourFrom: 10, endHourTo: 23 },
      {startDay: '2020-07-18', endDay: '2020-07-19', startHourFrom: 7, startHourTo: 13, endHourFrom: 20, endHourTo: 23 },
      {startDay: '2020-07-17', endDay: '2020-07-20', startHourFrom: 17, startHourTo: 23, endHourFrom: 1, endHourTo: 8 },
      {startDay: '2020-07-18', endDay: '2020-07-20', startHourFrom: 7, startHourTo: 13, endHourFrom: 1, endHourTo: 8 },
      // {startDay: '2020-09-04', endDay: '2020-09-06', startHourFrom: 17, startHourTo: 23, endHourFrom: 10, endHourTo: 23 },
      // {startDay: '2020-09-05', endDay: '2020-09-06', startHourFrom: 7, startHourTo: 13, endHourFrom: 20, endHourTo: 23 },
      // {startDay: '2020-09-04', endDay: '2020-09-07', startHourFrom: 17, startHourTo: 23, endHourFrom: 1, endHourTo: 8 },
      // {startDay: '2020-09-05', endDay: '2020-09-07', startHourFrom: 7, startHourTo: 13, endHourFrom: 1, endHourTo: 8 },
      // {startDay: '2020-09-11', endDay: '2020-09-13', startHourFrom: 17, startHourTo: 23, endHourFrom: 10, endHourTo: 23 },
      // {startDay: '2020-09-12', endDay: '2020-09-13', startHourFrom: 7, startHourTo: 13, endHourFrom: 20, endHourTo: 23 },
      // {startDay: '2020-09-11', endDay: '2020-09-14', startHourFrom: 17, startHourTo: 23, endHourFrom: 1, endHourTo: 8 },
      // {startDay: '2020-09-12', endDay: '2020-09-14', startHourFrom: 7, startHourTo: 13, endHourFrom: 1, endHourTo: 8 },
      // {startDay: '2020-09-18', endDay: '2020-09-20', startHourFrom: 17, startHourTo: 23, endHourFrom: 10, endHourTo: 23 },
      // {startDay: '2020-09-19', endDay: '2020-09-20', startHourFrom: 7, startHourTo: 13, endHourFrom: 20, endHourTo: 23 },
      // {startDay: '2020-09-18', endDay: '2020-09-21', startHourFrom: 17, startHourTo: 23, endHourFrom: 1, endHourTo: 8 },
      // {startDay: '2020-09-19', endDay: '2020-09-21', startHourFrom: 7, startHourTo: 13, endHourFrom: 1, endHourTo: 8 },
      // {startDay: '2020-09-25', endDay: '2020-09-27', startHourFrom: 17, startHourTo: 23, endHourFrom: 10, endHourTo: 23 },
      // {startDay: '2020-09-26', endDay: '2020-09-27', startHourFrom: 7, startHourTo: 13, endHourFrom: 20, endHourTo: 23 },
      // {startDay: '2020-09-25', endDay: '2020-09-28', startHourFrom: 17, startHourTo: 23, endHourFrom: 1, endHourTo: 8 },
      // {startDay: '2020-09-26', endDay: '2020-09-28', startHourFrom: 7, startHourTo: 13, endHourFrom: 1, endHourTo: 8 },
    ];
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

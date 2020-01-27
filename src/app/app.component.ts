import {Component, OnInit} from '@angular/core';
import {from, of} from 'rxjs';
import {concatMap} from 'rxjs/operators';
import {Flight, Hotel, Weekend} from './model';
import {
  GOOGLE_FLIGHTS_OPTIONS,
  GOOGLE_FLIGHTS_URL,
  HOLIDAY_BODY,
  TRIVAGO_BODY,
  TRIVAGO_GRAPHQL_URL,
  TRIVAGO_HOLIDAY_QUERY_PARAMS,
  TRIVAGO_OPTIONS,
  TRIVAGO_QUERY_PARAMS,
  TRIVAGO_SUGGESTIONS_BODY,
  TRIVAGO_SUGGESTIONS_OPTIONS,
  TRIVAGO_SUGGESTIONS_URL,
  WARSAW_BODY
} from './app-paths';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'botlot';
  private readonly maxMinuteDistanceForCloseFlights = 2.5;
  private maxCost = 800;
  private readonly startingDay = 5;
  private readonly endingDay = 7;
  private startingHour = 16;
  private endingHour = 12;
  private body; // TODO: remove
  private trivagoQueryParams = TRIVAGO_QUERY_PARAMS; // TODO: remove
  private readonly bannedCountries = [
    'Poland',
    'United Kingdom',
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
    'France'
  ];
  private readonly bannedCities = [
    'Kanton',
    'Nowe Delhi',
    'Hongkong',
    'Bangkok',
    'Tajpej',
  ];
  private flights: Flight[] = [];

  ngOnInit(): void {
    this.body = WARSAW_BODY;
    const weekends = this.buildRemainingWeekends();
    weekends[weekends.length - 1].isLast = true;
    from(weekends).pipe(
      concatMap(weekend => {
        return of(weekend).pipe(
          // delay(noisyDebounce)
        );
      })
    ).subscribe(weekend => {
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

  private getFlights(weekend: Weekend) {
    this.getRoundFlights(weekend);
    // if (this.body === this.chopinBody) {
    //   this.getOneWayFlights(weekend);
    // }
  }

  // private getOneWayFlights(weekend: Weekend) {
  //   fetch(GOOGLE_FLIGHTS_URL, this.options)
  //     .then(response => response.json())
  //     .then(response => this.appendRoundFlight(weekend, response))
  //     .catch(error => {
  //       this.flights[this.flights.length - 1].weekend.isLast = true;
  //       this.sendRoundFlights();
  //     });
  // }

  private getRoundFlights(weekend: Weekend, ) {
    const options = { ...GOOGLE_FLIGHTS_OPTIONS, body: JSON.stringify(this.body) };
    fetch(GOOGLE_FLIGHTS_URL, options)
      .then(response => response.json())
      .then(response => this.appendRoundFlight(weekend, response))
      .catch(error => {
        this.flights[this.flights.length - 1].weekend.isLast = true;
        this.sendRoundFlights();
      });
  }

  private appendRoundFlight(weekend: Weekend, response): void {
    this.flights = this.flights.concat(response[0][1][4][0]
      .filter(flightResponse => +flightResponse[1][0][1] < this.maxCost)
      .map((flightResponse): Flight => {
        const destination = response[0][0][3][0].find(d => d[0] === flightResponse[0]);
        return {
          cost: flightResponse[1][0][1] + ' zł',
          arrival: {
            city: destination[2],
            country: destination[4],
          },
          depart: {
            city: destination[2],
            country: destination[4],
          },
          isRound: true,
          weekend
        };
      })
      .filter((flight: Flight) => !this.isAirportBanned(flight))
    );
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
        this.fetchHotelAndAssignForRoundFlight(flight, options);
      });
  }

  private fetchHotelAndAssignForRoundFlight(flight, options) {
    flight.invocations++;
    fetch(TRIVAGO_GRAPHQL_URL, options)
      .then(response => response.json())
      .then(response => {
        const hotel = response.data.rs.accommodations.find(a => !a.accommodationType.value.includes('Hostel'));
        if (hotel) {
          this.assignHotelToRoundFlight(flight, hotel);
          if (flight.weekend.isLast) {
            this.flights.sort((a, b) => this.sortBySummary(a, b));
          }
          return;
        } else if (!response.data.rs.pollData || flight.invocations > 10) {
          if (flight.weekend.isLast) {
            this.flights.sort((a, b) => this.sortBySummary(a, b));
          }
          this.flights.splice(this.flights.indexOf(flight), 1);
          return;
        }
        this.fetchHotelAndAssignForRoundFlight(flight, options);
      })
      .catch(error => this.flights.sort((a, b) => this.sortBySummary(a, b)));
  }

  private assignHotelToRoundFlight(flight: Flight, hotel) {
    const hotelData: Hotel = {
      name: hotel.name.value,
      cost: hotel.deals.bestPrice.pricePerStay
    };
    flight.summary = +flight.cost.split(' ')[0] + hotelData.cost;
    flight.hotel = hotelData;
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
      this.maxCost = 3000;
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
          ? ',1322/105:1,9/132:1,1527/106:1'
          : ',1322/105:1,1320/105:1,1318/105:1,2555/106:1';
        return response.data.suggestions[0] + qualityCodes;
      });
  }
}


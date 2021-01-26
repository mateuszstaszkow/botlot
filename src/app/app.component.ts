import {Component, OnInit} from '@angular/core';
import {from, Observable, of} from 'rxjs';
import {Flight} from './model';
import {FlightService} from './flight.service';
import {concatMap, delay, map} from 'rxjs/operators';
import {HotelService} from './hotel.service';
import {ShuttleService} from './shuttle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public readonly REQUEST_DEBOUNCE_MS = 1000;
  public distinctCities: string[];
  public displayedFlights: Flight[] = [];
  public cachedFlights: Flight[] = [];
  public progress = 0;
  public flightsCount = 1;
  public isLogoInitial = true;
  private readonly MS_PER_DAY = 1000 * 3600 * 24;

  constructor(private readonly flightService: FlightService,
              private readonly hotelService: HotelService,
              private readonly shuttleService: ShuttleService) {}

  // TODO: add delay
  ngOnInit(): void {
    this.flightService.getFlights().pipe(
      concatMap(flights => {
        this.flightsCount = flights.length;
        return this.mapToDelayedObservableArray<Flight>(flights);
      }),
      concatMap(flight => this.hotelService.updateFlightWithHotelDetails(flight)),
      concatMap((f: Flight) => this.flightService.updateFlightWithAirportCoordinates(f).pipe(
        map(detailedFlight => ({ ...f, detailedFlight }))
      )),
      concatMap(f => f.detailedFlight ? this.shuttleService.updateFlightWithShuttle(f) : of(f))
    ).subscribe(f => {
      this.displayedFlights.push(f);
      this.sortFlightsByTotalAndFixMissingData();
      this.progress += 100 / this.flightsCount;
    });
    setTimeout(() => this.isLogoInitial = false, 5000);
  }

  get timeLeft(): number {
    return this.REQUEST_DEBOUNCE_MS * (100 - this.progress) * this.flightsCount / 100000;
  }

  public sortFlightsByTotalAndFixMissingData() {
    this.fixMissingFlightsData();
    this.displayedFlights.sort((a, b) => this.sortBySummary(a, b));
  }

  public sortFlightsByPricePerDayAndFixMissingData() {
    this.fixMissingFlightsData();
    this.displayedFlights.sort((a, b) => this.sortBySummaryPerDay(a, b));
  }

  public sortFlightsByFlightCostAndFixMissingData() {
    this.fixMissingFlightsData();
    this.displayedFlights.sort((a, b) => this.sortByFlightCost(a, b));
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

  public onSearchKeyUp(event: Event): void {
    const searchTerm: string = (<any>event.target).value;
    this.search(searchTerm);
  }

  private search(term: string): void {
    if (!this.cachedFlights.length) {
      this.cachedFlights = this.displayedFlights.slice(0);
    }
    if (!term) {
      this.displayedFlights = this.cachedFlights.slice(0);
      return;
    }
    this.displayedFlights = this.cachedFlights.filter(flight => [
        flight.hotel.name,
        flight.depart.city,
        flight.depart.country,
        flight.arrival.city,
        flight.arrival.country
      ].map(name => name.toLowerCase().includes(term.toLowerCase()))
      .reduce((a, b) => a || b)
    );
  }

  private fixMissingFlightsData(): void {
    this.displayedFlights.filter(f => f.hotel && (!f.arrival.endTaxiCost || !f.arrival.startTaxiCost))
      .forEach(errorFlight => {
        const similarFlight = this.displayedFlights.find(f => !!f.arrival.startTaxiCost
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

  private mapToDelayedObservableArray<T>(elements: T[]): Observable<T> {
    return from(elements).pipe(
      concatMap(element => {
        const noisyDebounce = this.REQUEST_DEBOUNCE_MS + (100 - Math.floor(Math.random() * 200));
        return of(element).pipe(
          delay(noisyDebounce)
        );
      })
    );
  }
}

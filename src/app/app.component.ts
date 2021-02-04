import {Component, OnDestroy, OnInit} from '@angular/core';
import {from, Observable, of, Subscription} from 'rxjs';
import {Flight} from './model';
import {FlightService} from './flight.service';
import {concatMap, delay, distinctUntilChanged, filter, map, take, tap} from 'rxjs/operators';
import {HotelService} from './hotel.service';
import {ShuttleService} from './shuttle.service';
import {FormControl, FormGroup} from '@angular/forms';

enum SortByType {
  TOTAL = 'TOTAL',
  PRICE_PER_DAY = 'PRICE_PER_DAY',
  FLIGHT_COST = 'FLIGHT_COST',
  FLIGHT_HOTEL_COST = 'FLIGHT_HOTEL_COST'
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public readonly SortByType = SortByType;
  public readonly SORT_BY_TYPES = Object.values(SortByType);
  public readonly REQUEST_DEBOUNCE_MS = 500;
  public distinctCities: string[];
  public displayedFlights: Flight[] = [];
  public cachedFlights: Flight[] = [];
  public progress = 0;
  public flightsCount = 1;
  public isLogoInitial = true;
  public isIncompleteVisible = false;
  private readonly MS_PER_DAY = 1000 * 3600 * 24;
  public readonly formGroup = new FormGroup({
    numberOfPeople: new FormControl(''),
    search: new FormControl(''),
    sort: new FormControl(SortByType.TOTAL)
  });
  private readonly formsSubscription = new Subscription();

  constructor(private readonly flightService: FlightService,
              private readonly hotelService: HotelService,
              private readonly shuttleService: ShuttleService) {}

  ngOnInit(): void {
    this.initializeFlightsFetch();
    this.initializeSorting();
    this.formGroup.controls.search.valueChanges
      .subscribe(searchTerm => this.search(searchTerm));
    setTimeout(() => this.isLogoInitial = false, 5000);
  }

  ngOnDestroy(): void {
    this.formsSubscription.unsubscribe();
  }

  get timeLeft(): string {
    const timeLeft = 3 * this.REQUEST_DEBOUNCE_MS * (100 - this.progress) * this.flightsCount / 100000;
    if (timeLeft > 60) {
      return (timeLeft / 60).toFixed(0) + ' min ' + (timeLeft % 60) + ' s';
    }
    return timeLeft.toFixed(0) + ' s';
  }

  get formattedProgress(): string {
    const progress = this.progress * this.flightsCount / 100;
    return progress.toFixed(0);
  }

  get completeIncompleteFlights(): number {
    const completeFlightsCount = this.displayedFlights.filter(flight => this.isFlightComplete(flight)).length;
    return this.isIncompleteVisible ? this.flightsCount : completeFlightsCount;
  }

  public isFlightComplete(flight: Flight): boolean {
    return !!flight.cost && !!flight.hotel?.cost && !!flight.arrival.startTaxiCost && !!flight.arrival.endTaxiCost;
  }

  public sortFlightsByTotal() {
    this.displayedFlights.sort((a, b) => this.sortBySummary(a, b));
  }

  public sortFlightsByPricePerDay() {
    this.displayedFlights.sort((a, b) => this.sortBySummaryPerDay(a, b));
  }

  public sortFlightsByFlightCost() {
    this.displayedFlights.sort((a, b) => this.sortByFlightCost(a, b));
  }

  public sortFlightsByFlightAndHotelCost() {
    this.displayedFlights.sort((a, b) => this.sortByFlightAndHotelCost(a, b));
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

  private initializeSorting(): void {
    this.formGroup.controls.sort.valueChanges.subscribe(type => {
      this.fixMissingFlightsData();
      switch (type) {
        case SortByType.TOTAL:
          return this.sortFlightsByTotal();
        case SortByType.PRICE_PER_DAY:
          return this.sortFlightsByPricePerDay();
        case SortByType.FLIGHT_COST:
          return this.sortFlightsByFlightCost();
        case SortByType.FLIGHT_HOTEL_COST:
          return this.sortFlightsByFlightAndHotelCost();
      }
    });
  }

  private initializeFlightsFetch(): void {
    this.formsSubscription.add(
      this.formGroup.controls.numberOfPeople.valueChanges.pipe(
        distinctUntilChanged(),
        concatMap(value => this.searchFlights(value))
      ).subscribe(f => {
        this.displayedFlights.push(f);
        this.sortFlightsByTotal();
        this.progress += 100 / this.flightsCount;
      })
    );
    this.formGroup.controls.numberOfPeople.setValue('1');
  }

  private searchFlights(numberOfPeople = this.formGroup.controls.numberOfPeople.value): Observable<Flight> {
    this.displayedFlights = [];
    this.progress = 0;
    return this.flightService.getFlights().pipe(
      take(1),
      concatMap(flights => {
        this.flightsCount = flights.length;
        return this.mapToDelayedObservableArray<Flight>(flights);
      }),
      concatMap(flight => this.hotelService.updateFlightWithHotelDetails(flight, numberOfPeople)),
      concatMap((f: Flight) => this.flightService.updateFlightWithAirportCoordinates(f).pipe(
        map(detailedFlight => ({ ...f, detailedFlight }))
      )),
      concatMap(f => f.detailedFlight ? this.shuttleService.updateFlightWithShuttle(f, numberOfPeople) : of(f)),
    );
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
        const similarFlight = this.displayedFlights.find(f =>
          !!f.arrival.startTaxiCost
          && !!f.hotel
          && !!errorFlight.hotel
          && f.hotel.name === errorFlight.hotel.name
          && f.arrival.city === errorFlight.arrival.city
        );
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
    return this.getSortIndicator(a.summary, b.summary);
  }

  private sortBySummaryPerDay(a: Flight, b: Flight): number {
    return this.getSortIndicator(this.getPricePerDay(a), this.getPricePerDay(b));
  }

  private sortByFlightCost(a: Flight, b: Flight): number {
    return this.getSortIndicator(a.cost, b.cost);
  }

  private sortByFlightAndHotelCost(a: Flight, b: Flight): number {
    return this.getSortIndicator(a.cost + a.hotel.cost, b.cost + b.hotel.cost);
  }

  private getSortIndicator(aPrice: number, bPrice: number): number {
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

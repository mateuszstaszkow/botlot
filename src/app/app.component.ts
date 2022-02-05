import {Component, OnDestroy, OnInit} from '@angular/core';
import {from, merge, Observable, of, Subject, Subscription} from 'rxjs';
import {CityCodeDto, Flight} from './model';
import {FlightService} from './flight.service';
import {catchError, concatMap, debounceTime, delay, distinctUntilChanged, filter, map, switchMap} from 'rxjs/operators';
import {HotelService} from './hotel.service';
import {ShuttleService} from './shuttle.service';
import {FormControl, FormGroup} from '@angular/forms';

import * as FileSaver from 'file-saver';

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
  public readonly SORT_BY_TYPES = Object.values(SortByType);
  public readonly REQUEST_DEBOUNCE_MS = 500;
  public readonly formGroup = new FormGroup({
    numberOfPeople: new FormControl(''),
    numberOfWeekends: new FormControl('1'),
    departFrom: new FormControl('15'),
    returnFrom: new FormControl('10'),
    search: new FormControl(''),
    sort: new FormControl(SortByType.TOTAL),
    city: new FormControl('')
  });

  public distinctCities: string[];
  public displayedFlights: Flight[] = [];
  public cachedFlights: Flight[] = [];
  public progress = 0;
  public flightsCount = 1;
  public isLogoInitial = true;
  public isIncompleteVisible = false;
  public citySuggestions$: Observable<CityCodeDto[]>;
  public isHotelVisible = true;
  public isShuttleVisible = true;

  public asiaDate = new Date(2021, 3, 4, 12, 5);
  public dateLeft = new Date(this.asiaDate.getTime() - new Date().getTime());

  private readonly MS_PER_DAY = 1000 * 3600 * 24;
  private readonly formsSubscription = new Subscription();

  private currentCity: CityCodeDto = {
    code: '/m/081m_',
    city: 'Warsaw',
    geocode: [21.0067249, 52.2319581]
  };
  private currentCity$ = new Subject<CityCodeDto>();

  constructor(private readonly flightService: FlightService,
              private readonly hotelService: HotelService,
              private readonly shuttleService: ShuttleService) {}

  ngOnInit(): void {
    this.initializeFlightsFetch();
    this.initializeSorting();
    this.initializeCitySuggestions();
    this.formGroup.controls.search.valueChanges
      .subscribe(searchTerm => this.search(searchTerm));
    setTimeout(() => this.isLogoInitial = false, 5000);
    setInterval(() => this.dateLeft = new Date(this.asiaDate.getTime() - new Date().getTime()), 1000);
  }

  ngOnDestroy(): void {
    this.formsSubscription.unsubscribe();
  }

  get timeLeft(): string {
    const timeLeft = 3 * this.REQUEST_DEBOUNCE_MS * (100 - this.progress) * this.flightsCount / 100000;
    if (timeLeft > 60) {
      return (timeLeft / 60).toFixed(0) + ' min ' + (timeLeft % 60).toFixed(0) + ' s';
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

  public saveFlights(): void {
    const flights = JSON.stringify(this.displayedFlights, null, 4);
    const today = new Date().toLocaleDateString();
    const blob = new Blob([flights], {
      type: "application/json"
    });
    FileSaver.saveAs(blob, today + ".json");
  }

  public isIncompleteCheckboxVisible(): boolean {
    return (this.progress >= 100) && ((this.completeIncompleteFlights < this.flightsCount) || this.isIncompleteVisible);
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

  public sortFlightsByCurrentTotalCost() {
    this.displayedFlights.sort((a, b) => this.sortByTotalCost(a, b));
  }

  public getPricePerDay(flight: Flight): number {
    const endTimeStamp = new Date(flight.weekend.endDay).getTime();
    const startTimeStamp = new Date(flight.weekend.startDay).getTime();
    const numberOfDays = (endTimeStamp - startTimeStamp) / this.MS_PER_DAY;
    const totalCost = this.getTotalCostFor(flight);
    return Math.round(totalCost / numberOfDays);
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

  public assignCityCodeAndGetFlights(cityCode: CityCodeDto): void {
    this.currentCity = cityCode;
    this.currentCity$.next(cityCode);
  }

  public mapToCityAndCountry(cityCode: CityCodeDto): string {
    return cityCode.country ? cityCode.city + ', ' + cityCode.country : cityCode.city;
  }

  public getTotalCostMessageFor(flight: Flight): string {
    let distribution = ' zł';
    if (this.isHotelVisible || this.isShuttleVisible) {
      distribution += ' (' + flight.cost + ' zł';
    }
    if (this.isHotelVisible && flight.hotel) {
      distribution += ' + ' + flight.hotel.cost + ' zł';
    }
    if (this.isShuttleVisible) {
      distribution += ' + ' + flight.arrival.startTaxiCost + ' zł + ' + flight.arrival.endTaxiCost + ' zł';
    }
    if (this.isHotelVisible || this.isShuttleVisible) {
      distribution += ')';
    }
    return this.getTotalCostFor(flight) + distribution;
  }

  private getTotalCostFor(flight: Flight): number {
    let total = flight.cost;
    if (this.isHotelVisible && flight.hotel) {
      total += flight.hotel.cost;
    }
    if (this.isShuttleVisible) {
      total += (flight.arrival.startTaxiCost + flight.arrival.endTaxiCost);
    }
    return total;
  }

  private initializeCitySuggestions(): void {
    const cityForm = this.formGroup.controls.city;
    this.citySuggestions$ = cityForm.valueChanges.pipe(
      distinctUntilChanged(),
      filter(value => value?.length > 2),
      debounceTime(200),
      concatMap(term => this.flightService.getCityCodes(term)),
      catchError(() => of([]))
    );
    cityForm.setValue('Warsaw');
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
      merge(
        this.formGroup.controls.numberOfPeople.valueChanges.pipe(distinctUntilChanged()),
        this.formGroup.controls.numberOfWeekends.valueChanges.pipe(distinctUntilChanged()),
        this.formGroup.controls.departFrom.valueChanges.pipe(distinctUntilChanged()),
        this.formGroup.controls.returnFrom.valueChanges.pipe(distinctUntilChanged()),
        this.currentCity$
      ).pipe(
        switchMap(() => this.searchFlights())
      ).subscribe(f => {
        this.displayedFlights.push(f);
        this.sortFlightsByTotal();
        this.progress += Math.ceil(100 / this.flightsCount);
      })
    );
    this.formGroup.controls.numberOfPeople.setValue('1');
  }

  private searchFlights(): Observable<Flight> {
    const numberOfPeople = Number(this.formGroup.controls.numberOfPeople.value);
    const numberOfWeekends = Number(this.formGroup.controls.numberOfWeekends.value);
    const departFrom = Number(this.formGroup.controls.departFrom.value);
    const returnFrom = Number(this.formGroup.controls.returnFrom.value);
    this.displayedFlights = [];
    this.progress = 0;
    this.flightsCount = 1;
    return this.flightService.getFlights(numberOfWeekends, departFrom, returnFrom, this.currentCity).pipe(
      concatMap(flights => {
        this.flightsCount = flights.length;
        return this.mapToDelayedObservableArray<Flight>(flights);
      }),
      map(flight => ({ ...flight, start: this.currentCity })),
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
    return this.getSortIndicator(a.cost + a.hotel?.cost, b.cost + b.hotel?.cost);
  }

  private sortByTotalCost(a: Flight, b: Flight): number {
    return this.getSortIndicator(this.getTotalCostFor(a), this.getTotalCostFor(b));
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

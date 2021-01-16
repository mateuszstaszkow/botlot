import {Component, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Flight} from './model';
import {FlightService} from './flight.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'botlot';
  public currentFlights = 0;
  public distinctCities: string[];
  private readonly MS_PER_DAY = 1000 * 3600 * 24;
  public filteredFlights: Flight[];
  public flights: Flight[] = [];
  public flights$: Observable<Flight[]>;
  private searchSubject: Subject<string> = new Subject();

  constructor(private readonly flightService: FlightService) {}

  ngOnInit(): void {
    this.flights$ = this.flightService.getFlights();
  }

  public sortFlightsByTotalAndFixMissingData() {
    this.fixMissingFlightsData();
    this.flights.sort((a, b) => this.sortBySummary(a, b));
    this.filteredFlights = this.flights.slice(0);
  }

  public sortFlightsByPricePerDayAndFixMissingData() {
    this.fixMissingFlightsData();
    this.flights.sort((a, b) => this.sortBySummaryPerDay(a, b));
    this.filteredFlights = this.flights.slice(0);
  }

  public sortFlightsByFlightCostAndFixMissingData() {
    this.fixMissingFlightsData();
    this.flights.sort((a, b) => this.sortByFlightCost(a, b));
    this.filteredFlights = this.flights.slice(0);
  }

  public getProgress(): number {
    if (!this.flights.length) {
      return 0;
    }
    return Math.round(this.currentFlights / this.flights.length * 100);
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
    this.searchSubject.next(searchTerm);
  }

  private search(term: string): void {
    this.filteredFlights = this.flights.filter(flight => [
        flight.hotel.name,
        flight.depart.city,
        flight.depart.country,
        flight.arrival.city,
        flight.arrival.country
      ].map(name => name.includes(term))
      .reduce((a, b) => a || b)
    );
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
}

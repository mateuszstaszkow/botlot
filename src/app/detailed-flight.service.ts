/* tslint:disable:max-line-length */
import {Injectable} from '@angular/core';
import {DetailedFlightAirports, Flight} from './model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetailedFlightService {

  constructor(private readonly httpClient: HttpClient) {
  }

  public getDetailedFlightInfo(flight: Flight, startHour: string, endHour: string): Observable<DetailedFlightAirports> {
    const params = new HttpParams({
      fromObject: {
        startAirport: flight.arrival.startId,
        endAirport: flight.arrival.endId,
        startDate: flight.weekend.friday,
        endDate: flight.weekend.sunday,
        startHour,
        endHour
      }
    });
    return this.httpClient.get<DetailedFlightAirports>('http://localhost:3000/detailed-flight', { params });
  }
}

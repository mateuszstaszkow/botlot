/* tslint:disable:max-line-length */
import {Injectable} from '@angular/core';
import {Flight} from './model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetailedFlightService {

  constructor(private readonly httpClient: HttpClient) {
  }

  public getDetailedFlightInfo(flight: Flight): Observable<any> {
    const params = new HttpParams({
      fromObject: {
        startAirport: flight.arrival.startId,
        endAirport: flight.arrival.endId,
        startDate: flight.weekend.startDay,
        endDate: flight.weekend.endDay,
        startHourFrom: String(flight.weekend.startHourFrom),
        startHourTo: String(flight.weekend.startHourTo),
        endHourFrom: String(flight.weekend.endHourFrom),
        endHourTo: String(flight.weekend.endHourTo)
      }
    });
    return this.httpClient.get<any>('http://localhost:3000/detailed-flight', { params });
  }
}

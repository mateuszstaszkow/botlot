import {Injectable} from '@angular/core';
import {DetailedFlightAirports, Flight} from './model';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly httpClient: HttpClient) {
  }

  public getFlights(): Observable<Flight[]> {
    return this.httpClient.get<Flight[]>(this.baseUrl + '/flights');
  }

  public updateFlightWithAirportCoordinates(flight: Flight): Observable<DetailedFlightAirports> {
    return this.httpClient.post<DetailedFlightAirports>(this.baseUrl + '/flight-airport-coordinates', flight);
  }
}

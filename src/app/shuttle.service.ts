import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Flight} from './model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShuttleService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly httpClient: HttpClient) {
  }

  public updateFlightWithShuttle(flight: Flight, numberOfPeople: number): Observable<Flight> {
    const url = this.baseUrl + '/flight-shuttle?numberOfPeople=' + numberOfPeople;
    return this.httpClient.post<Flight>(url, flight);
  }
}

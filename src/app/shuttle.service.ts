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

  public updateFlightWithShuttle(flight: Flight): Observable<Flight> {
    return this.httpClient.post<Flight>(this.baseUrl + '/flight-shuttle', flight);
  }
}

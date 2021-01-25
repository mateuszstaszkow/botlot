import { Injectable } from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Flight} from './model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly httpClient: HttpClient) {
  }

  public updateFlightWithHotelDetails(flight: Flight): Observable<Flight> {
    return this.httpClient.post<Flight>(this.baseUrl + '/flight-hotels', flight);
  }
}

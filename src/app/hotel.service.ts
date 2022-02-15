import { Injectable } from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Flight} from 'src/app/model/model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly httpClient: HttpClient) {
  }

  public updateFlightWithHotelDetails(flight: Flight, numberOfPeople: number): Observable<Flight> {
    const url = this.baseUrl + '/flight-hotels?numberOfPeople=' + numberOfPeople;
    return this.httpClient.post<Flight>(url, flight);
  }
}

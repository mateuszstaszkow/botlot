import {Injectable} from '@angular/core';
import {CityCodeDto, DetailedFlightAirports, Flight} from 'src/app/model/model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  private readonly baseUrl = environment.baseUrl;

  constructor(private readonly httpClient: HttpClient) {
  }

  public getFlights(numberOfWeekends: number, departFrom: number, returnFrom: number, cityCode: CityCodeDto): Observable<Flight[]> {
    const params = new HttpParams()
      .append('numberOfWeekends', String(numberOfWeekends))
      .append('departFrom', String(departFrom))
      .append('returnFrom', String(returnFrom))
      .append('code', cityCode.code)
      .append('geocode', String(JSON.stringify(cityCode.geocode)));
    return this.httpClient.get<Flight[]>(this.baseUrl + '/flights', { params });
  }

  public updateFlightWithAirportCoordinates(flight: Flight): Observable<DetailedFlightAirports> {
    return this.httpClient.post<DetailedFlightAirports>(this.baseUrl + '/flight-airport-coordinates', flight);
  }

  public getCityCodes(city: string): Observable<CityCodeDto[]> {
    return this.httpClient.get<CityCodeDto[]>(this.baseUrl + '/flight-city-codes/' + city);
  }
}

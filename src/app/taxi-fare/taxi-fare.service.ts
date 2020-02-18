import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TaxiFareResponseDto} from './taxi-fare-response.dto';
import {TaxiFareRequestDto} from './taxi-fare-request.dto';

@Injectable({
  providedIn: 'root'
})
export class TaxiFareService {

  constructor(private readonly httpClient: HttpClient) { }

  public getTaxiFaresForCities(distinctCities: string[]): Observable<TaxiFareResponseDto> {
    const payload = new TaxiFareRequestDto(distinctCities);
    return this.httpClient.post<TaxiFareResponseDto>('http://localhost:3000/taxi-fare', payload);
  }
}

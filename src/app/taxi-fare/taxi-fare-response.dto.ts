import {TaxiFareForCityDto} from './taxi-fare-for-city.dto';

export class TaxiFareResponseDto {
  faresByCities: { [city: string]: TaxiFareForCityDto } = {};
  currency = 'PLN';
}

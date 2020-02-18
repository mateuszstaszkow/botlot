export class TaxiFareRequestDto {
    cities: string[];
    currency: string;

    constructor(cities: string[]) {
      this.cities = cities;
      this.currency = 'PLN';
    }
}

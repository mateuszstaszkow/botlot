import {TaxiFareDto} from './taxi-fare.dto';

export class TaxiFareForCityDto {
  startingCost?: TaxiFareDto;
  costPerKilometer: TaxiFareDto;
  costPerHourWait?: TaxiFareDto;

  constructor(meanCostPerKm: number) {
    this.costPerKilometer = new TaxiFareDto();
    this.costPerKilometer.mean = meanCostPerKm;
  }
}

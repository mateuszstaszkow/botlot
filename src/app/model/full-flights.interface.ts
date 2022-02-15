import { Flight } from 'src/app/model/model';

export class FullFlights {
  _id: string; // ex format: '2022-02-15'
  data: Flight[];

  constructor(data: Flight[]) {
    this._id = new Date()
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '_');
    this.data = data;
  }
}

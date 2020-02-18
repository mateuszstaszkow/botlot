import { TestBed } from '@angular/core/testing';

import { TaxiFareService } from './taxi-fare.service';

describe('TaxiFareService', () => {
  let service: TaxiFareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxiFareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

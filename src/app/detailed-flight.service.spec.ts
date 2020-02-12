import { TestBed } from '@angular/core/testing';

import { DetailedFlightService } from './detailed-flight.service';

describe('DetailedFlightService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DetailedFlightService = TestBed.get(DetailedFlightService);
    expect(service).toBeTruthy();
  });
});

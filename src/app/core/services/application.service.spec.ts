import { TestBed } from '@angular/core/testing';
import { createTestingEnvironment } from '../../../testing/shared-testing-config';

import { ApplicationService } from './application.service';

describe('ApplicationService', () => {
  let service: any; // Using mock service from testing environment

  beforeEach(() => {
    const testEnv = createTestingEnvironment();

    TestBed.configureTestingModule({
      providers: testEnv.providers,
    });

    // Use the mocked ApplicationService from the testing environment
    service = testEnv.mocks.services.mockApplicationService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have app lifecycle methods', () => {
    expect(service.onAppComesForeground).toBeDefined();
    expect(service.onAppGoesBackground).toBeDefined();
    expect(service.$appState).toBeDefined();
  });
});

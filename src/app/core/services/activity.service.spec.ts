import { TestBed } from '@angular/core/testing';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(() => {
    const firebaseModule = createFirebaseTestingModule();

    TestBed.configureTestingModule({
      providers: [...firebaseModule.providers, ActivityService],
    });
    service = TestBed.inject(ActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

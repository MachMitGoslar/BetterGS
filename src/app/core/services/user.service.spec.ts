import { TestBed } from '@angular/core/testing';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    const firebaseModule = createFirebaseTestingModule();

    TestBed.configureTestingModule({
      providers: [...firebaseModule.providers, UserService],
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

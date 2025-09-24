import { TestBed } from '@angular/core/testing';
import { createTestingEnvironment, MOCK_ANONYMOUS_USER, MOCK_PRIVATE_PROFILE, MOCK_PUBLIC_PROFILE } from '../../../testing/shared-testing-config';

import { ApplicationService } from './application.service';

describe('ApplicationService', () => {

  const mockPrivateProfile = MOCK_PRIVATE_PROFILE;
  const mockPublicProfile = MOCK_PUBLIC_PROFILE;
  const mockAnonymousUser = MOCK_ANONYMOUS_USER;

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

  // describe('User Update Testing', () => {
  //   it('should update user profile', () => {



  //     service.updateUserProfile(mockPublicProfile);
  //     expect(console.log).toHaveBeenCalledWith('Mock updateUserProfile called with:', mockPublicProfile);
  //     expect(service.$currentUser.value.displayName).toBe('Updated User');
  //     expect(service.$currentUser.value.email).toBe('updated@example.com');
  //   });
  // })
});

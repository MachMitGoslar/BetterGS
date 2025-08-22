/**
 * Shared Testing Configuration
 *
 * Common testing utilities and configuration for component tests.
 * Provides standardized Firebase mocks, service stubs, and test data
 * for consistent testing across the application.
 *
 * @description Centralized testing infrastructure
 * @since 1.0.0
 * @author BetterGS Team
 */

import { BehaviorSubject, Observable, of } from 'rxjs';
import { createFirebaseTestingModule } from './firebase-testing-utils';

// ==========================================
// Common Test Data
// ==========================================

/**
 * Mock user authentication data
 */
export const MOCK_USER = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  isAnonymous: false,
  emailVerified: true,
  photoURL: 'https://example.com/avatar.jpg',
  metadata: {
    creationTime: '2024-01-01T00:00:00.000Z',
    lastSignInTime: '2024-01-15T10:30:00.000Z',
  },
};

/**
 * Mock anonymous user data
 */
export const MOCK_ANONYMOUS_USER = {
  uid: 'anon-uid-456',
  email: null,
  displayName: null,
  isAnonymous: true,
  emailVerified: false,
  photoURL: null,
  metadata: {
    creationTime: '2024-01-10T00:00:00.000Z',
    lastSignInTime: '2024-01-10T00:00:00.000Z',
  },
};

/**
 * Mock user public profile data
 */
export const MOCK_PUBLIC_PROFILE = {
  id: 'profile-123',
  name: 'Test User',
  profilePictureUrl: 'https://example.com/avatar.jpg',
  trackedTime: 7200000, // 2 hours
  total_trackings: 15,
  trackedActivities: 15,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  toDB: () => ({
    name: 'Test User',
    profilePictureUrl: 'https://example.com/avatar.jpg',
  }),
};

/**
 * Mock user private profile data
 */
export const MOCK_PRIVATE_PROFILE = {
  id: 'private-123',
  email: 'test@example.com',
  userId: 'test-uid-123',
  settings: {
    notifications: true,
    privacy: 'public',
  },
};

/**
 * Mock activity data
 */
export const MOCK_ACTIVITIES = [
  {
    id: 'activity-1',
    name: 'Running',
    description: 'Morning run in the park',
    category: 'fitness',
    duration: 1800000, // 30 minutes
    createdAt: new Date('2024-01-15'),
    userId: 'test-uid-123',
  },
  {
    id: 'activity-2',
    name: 'Reading',
    description: 'Technical book reading',
    category: 'learning',
    duration: 3600000, // 1 hour
    createdAt: new Date('2024-01-14'),
    userId: 'test-uid-123',
  },
];

/**
 * Mock tracking session data
 */
export const MOCK_TRACKING_SESSIONS = [
  {
    id: 'session-1',
    activityId: 'activity-1',
    startTime: new Date('2024-01-15T08:00:00Z'),
    endTime: new Date('2024-01-15T08:30:00Z'),
    duration: 1800000,
    userId: 'test-uid-123',
  },
  {
    id: 'session-2',
    activityId: 'activity-2',
    startTime: new Date('2024-01-14T19:00:00Z'),
    endTime: new Date('2024-01-14T20:00:00Z'),
    duration: 3600000,
    userId: 'test-uid-123',
  },
];

// ==========================================
// Service Mock Factory
// ==========================================

/**
 * Creates standardized service mocks
 *
 * @param overrides - Optional service overrides
 * @returns Object containing all mocked services
 */
export function createServiceMocks(overrides: any = {}) {
  // User Service Mock
  const userSubject = new BehaviorSubject(MOCK_USER);
  const publicProfileSubject = new BehaviorSubject(MOCK_PUBLIC_PROFILE);
  const privateProfileSubject = new BehaviorSubject(MOCK_PRIVATE_PROFILE);

  const mockUserService = {
    $currentUser: userSubject.asObservable(),
    $currentUserProfile: publicProfileSubject.asObservable(),
    $currentUserPrivateProfile: privateProfileSubject.asObservable(),
    getAllUsersForRanking: jasmine
      .createSpy('getAllUsersForRanking')
      .and.returnValue(of([MOCK_PUBLIC_PROFILE])),
    updateUserProfile: jasmine
      .createSpy('updateUserProfile')
      .and.returnValue(Promise.resolve()),
    deleteUser: jasmine
      .createSpy('deleteUser')
      .and.returnValue(Promise.resolve()),
    ...overrides.userService,
  };

  // Application Service Mock
  const mockApplicationService = {
    $currentUser: userSubject.asObservable(),
    updateUserProfile: jasmine
      .createSpy('updateUserProfile')
      .and.returnValue(Promise.resolve()),
    registerUserWithEmail: jasmine
      .createSpy('registerUserWithEmail')
      .and.returnValue(Promise.resolve()),
    changePassword: jasmine
      .createSpy('changePassword')
      .and.returnValue(Promise.resolve()),
    uploadUserProfileImage: jasmine
      .createSpy('uploadUserProfileImage')
      .and.returnValue(
        Promise.resolve('https://example.com/uploaded-image.jpg')
      ),
    logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve()),
    deleteAccount: jasmine
      .createSpy('deleteAccount')
      .and.returnValue(Promise.resolve()),
    ...overrides.applicationService,
  };

  // Activity Service Mock
  const activitiesSubject = new BehaviorSubject(MOCK_ACTIVITIES);
  const mockActivityService = {
    $activities: activitiesSubject.asObservable(),
    createActivity: jasmine
      .createSpy('createActivity')
      .and.returnValue(Promise.resolve()),
    updateActivity: jasmine
      .createSpy('updateActivity')
      .and.returnValue(Promise.resolve()),
    deleteActivity: jasmine
      .createSpy('deleteActivity')
      .and.returnValue(Promise.resolve()),
    ...overrides.activityService,
  };

  // Tracking Service Mock
  const mockTrackingService = {
    startTracking: jasmine
      .createSpy('startTracking')
      .and.returnValue(Promise.resolve()),
    stopTracking: jasmine
      .createSpy('stopTracking')
      .and.returnValue(Promise.resolve()),
    getCurrentSession: jasmine
      .createSpy('getCurrentSession')
      .and.returnValue(null),
    getTrackingSessions: jasmine
      .createSpy('getTrackingSessions')
      .and.returnValue(of(MOCK_TRACKING_SESSIONS)),
    ...overrides.trackingService,
  };

  // Notification Service Mock
  const mockNotificationService = {
    addNotification: jasmine.createSpy('addNotification'),
    clearNotifications: jasmine.createSpy('clearNotifications'),
    ...overrides.notificationService,
  };

  // I18n Service Mock
  const mockI18nService = {
    getTranslation: jasmine
      .createSpy('getTranslation')
      .and.callFake((key: string) => {
        const translations: { [key: string]: string } = {
          // Common translations
          'common.save': 'Save',
          'common.cancel': 'Cancel',
          'common.delete': 'Delete',
          'common.edit': 'Edit',
          'common.loading': 'Loading...',
          'common.error': 'Error',
          'common.success': 'Success',

          // Profile translations
          'profile.title': 'Profile',
          'profile.editProfile': 'Edit Profile',
          'profile.displayName': 'Display Name',
          'profile.email': 'Email',
          'profile.password': 'Password',
          'profile.confirmPassword': 'Confirm Password',
          'profile.currentPassword': 'Current Password',
          'profile.newPassword': 'New Password',
          'profile.profilePicture': 'Profile Picture',
          'profile.changeProfilePicture': 'Change Profile Picture',
          'profile.removeProfilePicture': 'Remove Profile Picture',
          'profile.updateSuccess': 'Profile updated successfully!',
          'profile.updateError': 'Failed to update profile. Please try again.',
          'profile.validationError':
            'Please fix the form errors before saving.',
          'profile.userDataMissing':
            'User data not available. Please try again.',
          'profile.logout': 'Logout',
          'profile.deleteAccount': 'Delete Account',
          'profile.confirmLogout': 'Are you sure you want to logout?',
          'profile.confirmDelete':
            'Are you sure you want to delete your account? This action cannot be undone.',
          'profile.imageTooLarge':
            'Image file is too large. Please choose a smaller file.',
          'profile.invalidImageType':
            'Invalid image type. Please choose a JPEG, PNG, GIF, or WebP image.',

          // Ranking translations
          'ranking.title': 'Ranking',
          'ranking.leaderboard': 'Leaderboard',
          'ranking.description': 'See how you compare with other users',
          'ranking.sessions': 'sessions',
          'ranking.session': 'session',
          'ranking.noUsers': 'No users found',
          'ranking.noUsersDescription': 'Be the first to start tracking',

          // Activity translations
          'activities.title': 'My Activities',
          'activities.noActivities': 'No activities found',
          'activities.noActivitiesDescription':
            'Create your first activity to get started',
          'activities.createActivity': 'Create Activity',
          'activities.editActivity': 'Edit Activity',
          'activities.deleteActivity': 'Delete Activity',
          'activities.activityName': 'Activity Name',
          'activities.description': 'Description',
          'activities.category': 'Category',
          'activities.createSuccess': 'Activity created successfully!',
          'activities.updateSuccess': 'Activity updated successfully!',
          'activities.deleteSuccess': 'Activity deleted successfully!',
          'activities.createError':
            'Failed to create activity. Please try again.',
          'activities.updateError':
            'Failed to update activity. Please try again.',
          'activities.deleteError':
            'Failed to delete activity. Please try again.',

          // User status translations
          'user.status.active': 'Active',
          'user.status.inactive': 'Inactive',
          'user.unknownUser': 'Unknown User',

          // Form validation translations
          'validation.required': 'This field is required',
          'validation.email': 'Please enter a valid email address',
          'validation.minLength':
            'This field must be at least {min} characters long',
          'validation.maxLength': 'This field cannot exceed {max} characters',
          'validation.passwordMatch': 'Passwords do not match',
        };
        return translations[key] || key;
      }),
    setLanguage: jasmine.createSpy('setLanguage'),
    getCurrentLanguage: jasmine
      .createSpy('getCurrentLanguage')
      .and.returnValue('en'),
    ...overrides.i18nService,
  };

  return {
    mockUserService,
    mockApplicationService,
    mockActivityService,
    mockTrackingService,
    mockNotificationService,
    mockI18nService,
    userSubject,
    publicProfileSubject,
    privateProfileSubject,
    activitiesSubject,
  };
}

// ==========================================
// Ionic Mocks
// ==========================================

/**
 * Creates standardized Ionic service mocks
 *
 * @param overrides - Optional Ionic service overrides
 * @returns Object containing all mocked Ionic services
 */
export function createIonicMocks(overrides: any = {}) {
  // Modal Controller Mock
  const mockModal = {
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
    onDidDismiss: jasmine
      .createSpy('onDidDismiss')
      .and.returnValue(Promise.resolve({ data: null })),
  };

  const mockModalController = {
    create: jasmine
      .createSpy('create')
      .and.returnValue(Promise.resolve(mockModal)),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
    getTop: jasmine
      .createSpy('getTop')
      .and.returnValue(Promise.resolve(mockModal)),
    ...overrides.modalController,
  };

  // Alert Controller Mock
  const mockAlert = {
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
  };

  const mockAlertController = {
    create: jasmine
      .createSpy('create')
      .and.returnValue(Promise.resolve(mockAlert)),
    ...overrides.alertController,
  };

  // Action Sheet Controller Mock
  const mockActionSheet = {
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
  };

  const mockActionSheetController = {
    create: jasmine
      .createSpy('create')
      .and.returnValue(Promise.resolve(mockActionSheet)),
    ...overrides.actionSheetController,
  };

  // Toast Controller Mock
  const mockToast = {
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
  };

  const mockToastController = {
    create: jasmine
      .createSpy('create')
      .and.returnValue(Promise.resolve(mockToast)),
    ...overrides.toastController,
  };

  // Loading Controller Mock
  const mockLoading = {
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
  };

  const mockLoadingController = {
    create: jasmine
      .createSpy('create')
      .and.returnValue(Promise.resolve(mockLoading)),
    ...overrides.loadingController,
  };

  // Platform Mock
  const mockPlatform = {
    is: jasmine.createSpy('is').and.callFake((platform: string) => {
      const platforms = overrides.platforms || ['desktop'];
      return platforms.includes(platform);
    }),
    ready: jasmine.createSpy('ready').and.returnValue(Promise.resolve()),
    ...overrides.platform,
  };

  // Router Mock
  const mockRouter = {
    navigate: jasmine
      .createSpy('navigate')
      .and.returnValue(Promise.resolve(true)),
    navigateByUrl: jasmine
      .createSpy('navigateByUrl')
      .and.returnValue(Promise.resolve(true)),
    ...overrides.router,
  };

  return {
    mockModalController,
    mockAlertController,
    mockActionSheetController,
    mockToastController,
    mockLoadingController,
    mockPlatform,
    mockRouter,
    mockModal,
    mockAlert,
    mockActionSheet,
    mockToast,
    mockLoading,
  };
}

// ==========================================
// Capacitor Mocks
// ==========================================

/**
 * Creates standardized Capacitor plugin mocks
 *
 * @param overrides - Optional Capacitor plugin overrides
 * @returns Object containing all mocked Capacitor plugins
 */
export function createCapacitorMocks(overrides: any = {}) {
  // Camera Mock
  const mockCamera = {
    getPhoto: jasmine.createSpy('getPhoto').and.returnValue(
      Promise.resolve({
        base64String: 'mock-base64-image-data',
        format: 'jpeg',
        webPath: 'data:image/jpeg;base64,mock-base64-image-data',
      })
    ),
    ...overrides.camera,
  };

  // File System Mock
  const mockFilesystem = {
    readFile: jasmine.createSpy('readFile').and.returnValue(
      Promise.resolve({
        data: 'mock-file-data',
      })
    ),
    writeFile: jasmine
      .createSpy('writeFile')
      .and.returnValue(Promise.resolve()),
    deleteFile: jasmine
      .createSpy('deleteFile')
      .and.returnValue(Promise.resolve()),
    ...overrides.filesystem,
  };

  // Network Mock
  const mockNetwork = {
    getStatus: jasmine.createSpy('getStatus').and.returnValue(
      Promise.resolve({
        connected: true,
        connectionType: 'wifi',
      })
    ),
    addListener: jasmine.createSpy('addListener').and.returnValue({
      remove: jasmine.createSpy('remove'),
    }),
    ...overrides.network,
  };

  return {
    mockCamera,
    mockFilesystem,
    mockNetwork,
  };
}

// ==========================================
// Complete Testing Setup
// ==========================================

/**
 * Creates a complete testing environment
 *
 * @param options - Configuration options for the testing environment
 * @returns Complete testing setup with all mocks and providers
 */
export function createTestingEnvironment(
  options: {
    initialData?: { [path: string]: any };
    serviceOverrides?: any;
    ionicOverrides?: any;
    capacitorOverrides?: any;
    platforms?: string[];
  } = {}
) {
  // Create Firebase testing module
  const firebaseModule = createFirebaseTestingModule(options.initialData);

  // Create service mocks
  const serviceMocks = createServiceMocks(options.serviceOverrides);

  // Create Ionic mocks
  const ionicMocks = createIonicMocks({
    ...options.ionicOverrides,
    platforms: options.platforms,
  });

  // Create Capacitor mocks
  const capacitorMocks = createCapacitorMocks(options.capacitorOverrides);

  // Combine all providers
  const providers = [
    ...firebaseModule.providers,

    // Service providers
    { provide: 'UserService', useValue: serviceMocks.mockUserService },
    {
      provide: 'ApplicationService',
      useValue: serviceMocks.mockApplicationService,
    },
    { provide: 'ActivityService', useValue: serviceMocks.mockActivityService },
    { provide: 'TrackingService', useValue: serviceMocks.mockTrackingService },
    {
      provide: 'NotificationService',
      useValue: serviceMocks.mockNotificationService,
    },
    { provide: 'I18nService', useValue: serviceMocks.mockI18nService },

    // Ionic providers
    { provide: 'ModalController', useValue: ionicMocks.mockModalController },
    { provide: 'AlertController', useValue: ionicMocks.mockAlertController },
    {
      provide: 'ActionSheetController',
      useValue: ionicMocks.mockActionSheetController,
    },
    { provide: 'ToastController', useValue: ionicMocks.mockToastController },
    {
      provide: 'LoadingController',
      useValue: ionicMocks.mockLoadingController,
    },
    { provide: 'Platform', useValue: ionicMocks.mockPlatform },
    { provide: 'Router', useValue: ionicMocks.mockRouter },

    // Capacitor providers
    { provide: 'Camera', useValue: capacitorMocks.mockCamera },
    { provide: 'Filesystem', useValue: capacitorMocks.mockFilesystem },
    { provide: 'Network', useValue: capacitorMocks.mockNetwork },
  ];

  return {
    providers,
    mocks: {
      firebase: firebaseModule,
      services: serviceMocks,
      ionic: ionicMocks,
      capacitor: capacitorMocks,
    },
  };
}

// ==========================================
// Test Utilities
// ==========================================

/**
 * Utility function to trigger observable emissions in tests
 *
 * @param subject - BehaviorSubject to update
 * @param value - New value to emit
 */
export function triggerObservableUpdate<T>(
  subject: BehaviorSubject<T>,
  value: T
): void {
  subject.next(value);
}

/**
 * Utility function to wait for async operations in tests
 *
 * @param ms - Milliseconds to wait
 */
export function waitAsync(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Utility function to simulate user interactions
 */
export const TestInteractions = {
  /**
   * Simulate form input
   */
  setFormValue(form: any, controlName: string, value: any): void {
    const control = form.get(controlName);
    if (control) {
      control.setValue(value);
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  },

  /**
   * Simulate form submission
   */
  submitForm(form: any): void {
    form.markAllAsTouched();
    form.updateValueAndValidity();
  },

  /**
   * Simulate button click
   */
  clickButton(element: HTMLElement): void {
    element.click();
    element.dispatchEvent(new Event('click', { bubbles: true }));
  },
};

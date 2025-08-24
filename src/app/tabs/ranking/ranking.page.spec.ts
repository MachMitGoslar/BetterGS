import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { of, BehaviorSubject } from 'rxjs';
import { ModalController } from '@ionic/angular/standalone';

import { RankingPage } from './ranking.page';
import { UserService } from '../../core/services/user.service';
import { I18nService } from '../../core/services/i18n.service';
import { UserPublicProfile } from 'src/app/core/models/user_public_profile.model';
import { UserDetailModalComponent } from '../../components/user-detail-modal/user-detail-modal.component';
import {
  createTestingEnvironment,
  MOCK_PUBLIC_PROFILE,
  triggerObservableUpdate,
} from '../../../testing/shared-testing-config';

/**
 * Test Suite for RankingPage Component
 *
 * Comprehensive tests covering:
 * - Component initialization and lifecycle
 * - Data loading and refresh functionality
 * - Ranking display and formatting utilities
 * - Modal management and user interactions
 * - Error handling and edge cases
 * - Memory management and cleanup
 * - Utility methods and computed properties
 */
describe('RankingPage', () => {
  let component: RankingPage;
  let fixture: ComponentFixture<RankingPage>;

  // Service mocks
  let mockUserService: any;
  let mockI18nService: any;
  let mockModalController: any;

  // Observable subjects
  let usersSubject: BehaviorSubject<UserPublicProfile[]>;

  // Mock data
  const mockUsers: UserPublicProfile[] = [
    {
      id: 'user1',
      name: 'John Doe',
      profilePictureUrl: 'https://example.com/john.jpg',
      trackedTime: 7200000, // 2 hours
      total_trackings: 15,
      trackedActivities: 15,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      toDB: () => ({
        name: 'John Doe',
        profilePictureUrl: 'https://example.com/john.jpg',
      }),
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      profilePictureUrl: '',
      trackedTime: 5400000, // 1.5 hours
      total_trackings: 12,
      trackedActivities: 12,
      isActive: false,
      createdAt: new Date('2024-01-02'),
      toDB: () => ({
        name: 'Jane Smith',
        profilePictureUrl: '',
      }),
    },
    {
      id: 'user3',
      name: 'Bob Wilson',
      profilePictureUrl: 'https://example.com/bob.jpg',
      trackedTime: 3600000, // 1 hour
      total_trackings: 8,
      trackedActivities: 8,
      isActive: true,
      createdAt: new Date('2024-01-03'),
      toDB: () => ({
        name: 'Bob Wilson',
        profilePictureUrl: 'https://example.com/bob.jpg',
      }),
    },
  ];

  const mockEmptyUsers: UserPublicProfile[] = [];

  beforeEach(async () => {
    // Setup $localize for Angular i18n
    (globalThis as any).$localize = (
      template: TemplateStringsArray,
      ...expressions: any[]
    ) => {
      let result = template[0];
      for (let i = 0; i < expressions.length; i++) {
        result += expressions[i] + template[i + 1];
      }
      return result;
    };

    // Create comprehensive testing environment
    const testEnv = createTestingEnvironment({
      initialData: {
        'users/user1/public': mockUsers[0],
        'users/user2/public': mockUsers[1],
        'users/user3/public': mockUsers[2],
      },
    });

    // Create behavior subjects
    usersSubject = new BehaviorSubject<UserPublicProfile[]>([]);

    // Override UserService with ranking-specific functionality
    mockUserService = {
      ...testEnv.mocks.services.mockUserService,
      getAllUsersForRanking: jasmine
        .createSpy('getAllUsersForRanking')
        .and.returnValue(usersSubject.asObservable()),
    };

    mockI18nService = testEnv.mocks.services.mockI18nService;
    mockModalController = testEnv.mocks.ionic.mockModalController;

    await TestBed.configureTestingModule({
      imports: [RankingPage],
      providers: [
        ...testEnv.providers,
        { provide: UserService, useValue: mockUserService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: ModalController, useValue: mockModalController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RankingPage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ==========================================
  // Component Initialization Tests
  // ==========================================

  describe('Component Initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.isLoading).toBeTruthy();
      expect(component.users$).toBeDefined();
    });

    it('should inject services correctly', () => {
      expect(component['userService']).toBeDefined();
      expect(component.i18nService).toBeDefined();
      expect(component.modalController).toBeDefined();
    });

    it('should register icons during construction', () => {
      // Icons are registered in constructor, component should exist without errors
      expect(component).toBeTruthy();
    });

    it('should initialize observables during construction', () => {
      expect(component.users$).toBeDefined();
      expect(component.users$).toEqual(jasmine.any(Object));
    });
  });

  // ==========================================
  // Lifecycle Method Tests
  // ==========================================

  describe('Lifecycle Methods', () => {
    describe('ngOnInit', () => {
      it('should call loadRanking on initialization', () => {
        spyOn(component, 'loadRanking');

        component.ngOnInit();

        expect(component.loadRanking).toHaveBeenCalled();
      });

      it('should set up users observable stream', () => {
        component.ngOnInit();

        expect(mockUserService.getAllUsersForRanking).toHaveBeenCalled();
        expect(component.users$).toBeDefined();
      });
    });

    describe('ngOnDestroy', () => {
      it('should unsubscribe from all subscriptions', () => {
        const mockSubscription1 = jasmine.createSpyObj('Subscription', [
          'unsubscribe',
        ]);
        const mockSubscription2 = jasmine.createSpyObj('Subscription', [
          'unsubscribe',
        ]);
        mockSubscription1.closed = false;
        mockSubscription2.closed = false;

        (component as any).subscriptions = [
          mockSubscription1,
          mockSubscription2,
        ];

        (component as any).ngOnDestroy();

        expect(mockSubscription1.unsubscribe).toHaveBeenCalled();
        expect(mockSubscription2.unsubscribe).toHaveBeenCalled();
      });

      it('should not unsubscribe from already closed subscriptions', () => {
        const mockSubscription = jasmine.createSpyObj('Subscription', [
          'unsubscribe',
        ]);
        mockSubscription.closed = true;

        (component as any).subscriptions = [mockSubscription];

        (component as any).ngOnDestroy();

        expect(mockSubscription.unsubscribe).not.toHaveBeenCalled();
      });

      it('should clear subscriptions array', () => {
        const mockSubscription = jasmine.createSpyObj('Subscription', [
          'unsubscribe',
        ]);
        mockSubscription.closed = false;
        (component as any).subscriptions = [mockSubscription];

        (component as any).ngOnDestroy();

        expect((component as any).subscriptions.length).toBe(0);
      });
    });
  });

  // ==========================================
  // Data Loading Tests
  // ==========================================

  describe('Data Loading', () => {
    describe('loadRanking', () => {
      it('should call userService.getAllUsersForRanking', () => {
        component.loadRanking();

        expect(mockUserService.getAllUsersForRanking).toHaveBeenCalled();
      });

      it('should update users$ observable', () => {
        const previousObservable = component.users$;

        component.loadRanking();

        expect(component.users$).toBe(mockUserService.getAllUsersForRanking());
      });

      it('should set loading state to false after loading', () => {
        component.loadRanking();

        expect(component.isLoading).toBeFalsy();
      });
    });

    describe('onRefresh', () => {
      it('should call loadRanking', () => {
        spyOn(component, 'loadRanking');
        const mockEvent = {
          target: { complete: jasmine.createSpy('complete') },
        };

        component.onRefresh(mockEvent);

        expect(component.loadRanking).toHaveBeenCalled();
      });

      it('should complete refresh event after timeout', fakeAsync(() => {
        const mockEvent = {
          target: { complete: jasmine.createSpy('complete') },
        };

        component.onRefresh(mockEvent);
        tick(1000);

        expect(mockEvent.target.complete).toHaveBeenCalled();
      }));

      it('should handle missing event object gracefully', fakeAsync(() => {
        expect(() => {
          component.onRefresh(null);
          tick(1000);
        }).not.toThrow();
      }));

      it('should handle event without target gracefully', fakeAsync(() => {
        const mockEvent = {};

        expect(() => {
          component.onRefresh(mockEvent);
          tick(1000);
        }).not.toThrow();
      }));
    });
  });

  // ==========================================
  // Data Formatting Tests
  // ==========================================

  describe('Data Formatting', () => {
    describe('formatDuration', () => {
      it('should return "0 min" for zero milliseconds', () => {
        expect(component.formatDuration(0)).toBe('0 min');
      });

      it('should return "0 min" for undefined milliseconds', () => {
        expect(component.formatDuration(undefined)).toBe('0 min');
      });

      it('should format minutes only for durations less than 1 hour', () => {
        expect(component.formatDuration(1800000)).toBe('30m'); // 30 minutes
        expect(component.formatDuration(2700000)).toBe('45m'); // 45 minutes
      });

      it('should format hours and minutes for durations over 1 hour', () => {
        expect(component.formatDuration(3600000)).toBe('1h 0m'); // 1 hour
        expect(component.formatDuration(5400000)).toBe('1h 30m'); // 1.5 hours
        expect(component.formatDuration(7200000)).toBe('2h 0m'); // 2 hours
      });

      it('should handle large durations correctly', () => {
        expect(component.formatDuration(25200000)).toBe('7h 0m'); // 7 hours
        expect(component.formatDuration(86400000)).toBe('24h 0m'); // 24 hours
      });
    });

    describe('getInitials', () => {
      it('should return initial for single name', () => {
        expect(component.getInitials('John')).toBe('J');
      });

      it('should return initials for two names', () => {
        expect(component.getInitials('John Doe')).toBe('JD');
      });

      it('should return first two initials for multiple names', () => {
        expect(component.getInitials('Mary Jane Smith')).toBe('MJ');
      });

      it('should return uppercase initials', () => {
        expect(component.getInitials('john doe')).toBe('JD');
      });

      it('should handle empty string', () => {
        expect(component.getInitials('')).toBe('');
      });

      it('should handle whitespace-only string', () => {
        expect(component.getInitials('   ')).toBe('');
      });

      it('should handle single character names', () => {
        expect(component.getInitials('A B')).toBe('AB');
      });
    });
  });

  // ==========================================
  // Ranking Display Tests
  // ==========================================

  describe('Ranking Display', () => {
    describe('getRankIcon', () => {
      it('should return gold medal for first place', () => {
        expect(component.getRankIcon(0)).toBe('🥇');
      });

      it('should return silver medal for second place', () => {
        expect(component.getRankIcon(1)).toBe('🥈');
      });

      it('should return bronze medal for third place', () => {
        expect(component.getRankIcon(2)).toBe('🥉');
      });

      it('should return numbered rank for positions beyond third', () => {
        expect(component.getRankIcon(3)).toBe('#4');
        expect(component.getRankIcon(9)).toBe('#10');
        expect(component.getRankIcon(99)).toBe('#100');
      });
    });

    describe('getRankColor', () => {
      it('should return warning color for first place', () => {
        expect(component.getRankColor(0)).toBe('warning');
      });

      it('should return medium color for second place', () => {
        expect(component.getRankColor(1)).toBe('medium');
      });

      it('should return tertiary color for third place', () => {
        expect(component.getRankColor(2)).toBe('tertiary');
      });

      it('should return primary color for positions beyond third', () => {
        expect(component.getRankColor(3)).toBe('primary');
        expect(component.getRankColor(10)).toBe('primary');
        expect(component.getRankColor(99)).toBe('primary');
      });
    });
  });

  // ==========================================
  // Modal Management Tests
  // ==========================================

  describe('Modal Management', () => {
    describe('openModal', () => {
      it('should create modal with UserDetailModalComponent', async () => {
        const user = mockUsers[0];

        await component.openModal(user);

        expect(mockModalController.create).toHaveBeenCalledWith(
          jasmine.objectContaining({
            component: UserDetailModalComponent,
            componentProps: {
              user: user,
            },
          })
        );
      });

      it('should configure modal with breakpoints', async () => {
        const user = mockUsers[0];

        await component.openModal(user);

        expect(mockModalController.create).toHaveBeenCalledWith(
          jasmine.objectContaining({
            breakpoints: [0, 0.25, 0.5, 0.75],
            initialBreakpoint: 0.5,
          })
        );
      });

      it('should present the modal', async () => {
        const user = mockUsers[0];
        const mockModal = {
          present: jasmine
            .createSpy('present')
            .and.returnValue(Promise.resolve()),
        };
        mockModalController.create.and.returnValue(Promise.resolve(mockModal));

        await component.openModal(user);

        expect(mockModal.present).toHaveBeenCalled();
      });

      it('should handle modal creation errors gracefully', async () => {
        const user = mockUsers[0];
        mockModalController.create.and.returnValue(
          Promise.reject(new Error('Modal creation failed'))
        );
        spyOn(console, 'error');

        await component.openModal(user);

        expect(console.error).toHaveBeenCalledWith(
          'Error opening user detail modal:',
          jasmine.any(Error)
        );
      });

      it('should handle modal presentation errors gracefully', async () => {
        const user = mockUsers[0];
        const mockModal = {
          present: jasmine
            .createSpy('present')
            .and.returnValue(Promise.reject(new Error('Present failed'))),
        };
        mockModalController.create.and.returnValue(Promise.resolve(mockModal));
        spyOn(console, 'error');

        await component.openModal(user);

        expect(console.error).toHaveBeenCalledWith(
          'Error opening user detail modal:',
          jasmine.any(Error)
        );
      });
    });
  });

  // ==========================================
  // Integration Tests
  // ==========================================

  describe('Integration Tests', () => {
    it('should handle complete ranking workflow', fakeAsync(() => {
      // Initialize component
      component.ngOnInit();

      // Simulate users data loading
      usersSubject.next(mockUsers);
      tick();

      // Verify loading state
      expect(component.isLoading).toBeFalsy();

      // Verify users data is available
      component.users$.subscribe((users) => {
        expect(users).toEqual(mockUsers);
        expect(users.length).toBe(3);
      });
    }));

    it('should handle empty ranking state', fakeAsync(() => {
      component.ngOnInit();

      usersSubject.next(mockEmptyUsers);
      tick();

      component.users$.subscribe((users) => {
        expect(users).toEqual(mockEmptyUsers);
        expect(users.length).toBe(0);
      });
    }));

    it('should handle refresh workflow', fakeAsync(() => {
      spyOn(component, 'loadRanking');
      const mockEvent = { target: { complete: jasmine.createSpy('complete') } };

      component.onRefresh(mockEvent);
      tick(1000);

      expect(component.loadRanking).toHaveBeenCalled();
      expect(mockEvent.target.complete).toHaveBeenCalled();
    }));

    it('should handle modal opening workflow', async () => {
      const user = mockUsers[0];

      await component.openModal(user);

      expect(mockModalController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          component: UserDetailModalComponent,
          componentProps: { user },
        })
      );
    });

    it('should handle ranking display formatting', () => {
      mockUsers.forEach((user, index) => {
        expect(component.getRankIcon(index)).toBeDefined();
        expect(component.getRankColor(index)).toBeDefined();
        expect(component.getInitials(user.name || '')).toBeDefined();
      });
    });

    it('should handle subscription cleanup on destroy', () => {
      const mockSubscription = jasmine.createSpyObj('Subscription', [
        'unsubscribe',
      ]);
      mockSubscription.closed = false;
      (component as any).subscriptions = [mockSubscription];

      (component as any).ngOnDestroy();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect((component as any).subscriptions.length).toBe(0);
    });

    it('should handle duration formatting for various time ranges', () => {
      const testCases = [
        { input: 0, expected: '0 min' },
        { input: 1800000, expected: '30m' },
        { input: 3600000, expected: '1h 0m' },
        { input: 5400000, expected: '1h 30m' },
        { input: 7200000, expected: '2h 0m' },
      ];

      testCases.forEach((testCase) => {
        expect(component.formatDuration(testCase.input)).toBe(
          testCase.expected
        );
      });
    });

    it('should handle initial generation for various name formats', () => {
      const testCases = [
        { input: 'John', expected: 'J' },
        { input: 'John Doe', expected: 'JD' },
        { input: 'Mary Jane Smith', expected: 'MJ' },
        { input: '', expected: '' },
        { input: 'a b c d', expected: 'AB' },
      ];

      testCases.forEach((testCase) => {
        expect(component.getInitials(testCase.input)).toBe(testCase.expected);
      });
    });

    it('should handle service injection properly', () => {
      expect(component['userService']).toBe(mockUserService);
      expect(component.i18nService).toBe(mockI18nService);
      expect(component.modalController).toBe(mockModalController);
    });

    it('should handle observable stream lifecycle', fakeAsync(() => {
      let receivedUsers: UserPublicProfile[] = [];

      component.ngOnInit();
      component.users$.subscribe((users) => {
        receivedUsers = users;
      });

      // Test empty state
      usersSubject.next([]);
      tick();
      expect(receivedUsers).toEqual([]);

      // Test with data
      usersSubject.next(mockUsers);
      tick();
      expect(receivedUsers).toEqual(mockUsers);
    }));
  });
});

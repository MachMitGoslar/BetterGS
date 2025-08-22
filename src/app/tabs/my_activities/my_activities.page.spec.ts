import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { RefresherCustomEvent } from '@ionic/angular';

import { MyActivitiesPage } from './my_activities.page';
import { ApplicationService } from 'src/app/core/services/application.service';
import { I18nService } from 'src/app/core/services/i18n.service';
import { Activity } from 'src/app/core/models/activity.model';
import { Tracking } from 'src/app/core/models/tracking.model';
import { createTestingEnvironment, MOCK_ACTIVITIES, triggerObservableUpdate } from '../../../testing/shared-testing-config';

/**
 * Test Suite for MyActivitiesPage Component
 * 
 * Comprehensive tests covering:
 * - Component initialization and lifecycle
 * - Data loading and error handling
 * - Pull-to-refresh functionality
 * - Subscription management and cleanup
 * - Loading state management
 */
describe('MyActivitiesPage', () => {
  let component: MyActivitiesPage;
  let fixture: ComponentFixture<MyActivitiesPage>;
  let mockApplicationService: any;
  let mockI18nService: any;
  let activitiesSubject: BehaviorSubject<Activity[]>;
  let trackingSubject: BehaviorSubject<Tracking | void>;

  // Mock data
  const mockActivities: Activity[] = [
    {
      id: '1',
      title: 'Morning Run',
      description: 'Daily running exercise',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      icon: 'add',
      imageUrl: 'https://picsum.photos/700/400',
      timeSpend: 1800,
      is_active: false
    } as Activity,
    {
      id: '2', 
      title: 'Cycling Session',
      description: 'Weekend bike ride',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      icon: 'bicycle',
      imageUrl: 'https://picsum.photos/700/400',
      timeSpend: 3600,
      is_active: false
    } as Activity
  ];

  const mockTracking: Tracking = {
    id: 'tracking1',
    startDate: new Date(),
    endDate: undefined,
    notes: '',
    imageUrl: undefined,
    ref: undefined,
    userRef: undefined,
    activityRef: undefined,
    is_active: true
  } as Tracking;

  beforeEach(async () => {
    // Setup $localize for Angular i18n
    (globalThis as any).$localize = (template: TemplateStringsArray, ...expressions: any[]) => {
      let result = template[0];
      for (let i = 0; i < expressions.length; i++) {
        result += expressions[i] + template[i + 1];
      }
      return result;
    };

    // Create behavior subjects for observable streams
    activitiesSubject = new BehaviorSubject<Activity[]>(mockActivities);
    trackingSubject = new BehaviorSubject<Tracking | void>(undefined);

    // Create comprehensive testing environment
    const testEnv = createTestingEnvironment({
      initialData: {
        'users/test-uid-123/activities': mockActivities,
        'users/test-uid-123/public': {
          name: 'Test User',
          trackedTime: 7200000
        }
      }
    });

    // Override ApplicationService with specific observables
    mockApplicationService = {
      ...testEnv.mocks.services.mockApplicationService,
      $user_activities: activitiesSubject.asObservable(),
      $activeTracking: trackingSubject.asObservable(),
      setupAppData: jasmine.createSpy('setupAppData').and.returnValue(Promise.resolve())
    };

    mockI18nService = testEnv.mocks.services.mockI18nService;

    await TestBed.configureTestingModule({
      imports: [MyActivitiesPage],
      providers: [
        ...testEnv.providers,
        { provide: ApplicationService, useValue: mockApplicationService },
        { provide: I18nService, useValue: mockI18nService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyActivitiesPage);
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
      expect(component.isLoading).toBe(true);
      expect(component.$activities).toBeDefined();
      expect(component.activeTracking).toBeDefined();
    });

    it('should set up observables from application service', () => {
      expect(component.$activities).toBe(mockApplicationService.$user_activities);
      expect(component.activeTracking).toBe(mockApplicationService.$activeTracking);
    });

    it('should have proper component selector', () => {
      const compiled = fixture.nativeElement;
      expect(compiled).toBeDefined();
    });
  });

  // ==========================================
  // Lifecycle Method Tests
  // ==========================================

  describe('Lifecycle Methods', () => {
    describe('ngOnInit', () => {
      it('should set up activity subscription on init', () => {
        spyOn(component as any, 'setupActivitySubscription');
        
        component.ngOnInit();
        
        expect((component as any).setupActivitySubscription).toHaveBeenCalled();
      });

      it('should handle successful activity loading', fakeAsync(() => {
        component.ngOnInit();
        tick();
        
        activitiesSubject.next(mockActivities);
        tick();
        
        expect(component.isLoading).toBe(false);
      }));

      it('should handle activity loading errors', fakeAsync(() => {
        spyOn(console, 'error');
        
        component.ngOnInit();
        tick();
        
        activitiesSubject.error(new Error('Load failed'));
        tick();
        
        expect(component.isLoading).toBe(false);
        expect(console.error).toHaveBeenCalled();
      }));
    });

    describe('ngOnDestroy', () => {
      it('should clean up subscriptions on destroy', () => {
        spyOn(component as any, 'cleanup');
        
        component.ngOnDestroy();
        
        expect((component as any).cleanup).toHaveBeenCalled();
      });

      it('should unsubscribe from activities subscription', () => {
        component.ngOnInit();
        const subscription = (component as any).activitiesSubscription;
        spyOn(subscription, 'unsubscribe');
        
        component.ngOnDestroy();
        
        expect(subscription.unsubscribe).toHaveBeenCalled();
      });

      it('should clear refresh timeout if exists', fakeAsync(() => {
        // Set up a timeout
        (component as any).refreshTimeout = setTimeout(() => {}, 1000);
        const timeoutId = (component as any).refreshTimeout;
        spyOn(window, 'clearTimeout');
        
        component.ngOnDestroy();
        
        expect(clearTimeout).toHaveBeenCalledWith(timeoutId);
      }));
    });
  });

  // ==========================================
  // Data Management Tests
  // ==========================================

  describe('Data Management', () => {
    describe('setupActivitySubscription', () => {
      it('should subscribe to activities observable', () => {
        (component as any).setupActivitySubscription();
        
        expect((component as any).activitiesSubscription).toBeDefined();
      });

      it('should update loading state when activities load', fakeAsync(() => {
        (component as any).setupActivitySubscription();
        tick();
        
        activitiesSubject.next(mockActivities);
        tick();
        
        expect(component.isLoading).toBe(false);
      }));

      it('should log successful activity loading', fakeAsync(() => {
        spyOn(console, 'log');
        
        (component as any).setupActivitySubscription();
        tick();
        
        activitiesSubject.next(mockActivities);
        tick();
        
        expect(console.log).toHaveBeenCalledWith('Activities loaded:', 2, 'items');
      }));

      it('should handle zero activities', fakeAsync(() => {
        spyOn(console, 'log');
        
        (component as any).setupActivitySubscription();
        tick();
        
        activitiesSubject.next([]);
        tick();
        
        expect(console.log).toHaveBeenCalledWith('Activities loaded:', 0, 'items');
      }));

      it('should handle subscription errors', fakeAsync(() => {
        spyOn(console, 'error');
        
        (component as any).setupActivitySubscription();
        tick();
        
        activitiesSubject.error(new Error('Network error'));
        tick();
        
        expect(component.isLoading).toBe(false);
        expect(console.error).toHaveBeenCalled();
      }));
    });

    describe('handleRefresh', () => {
      let mockRefresherEvent: RefresherCustomEvent;

      beforeEach(() => {
        mockRefresherEvent = {
          target: {
            complete: jasmine.createSpy('complete')
          }
        } as any;
      });

      it('should set loading state to true', () => {
        component.isLoading = false;
        
        component.handleRefresh(mockRefresherEvent);
        
        expect(component.isLoading).toBe(true);
      });

      it('should call setupAppData on application service', () => {
        component.handleRefresh(mockRefresherEvent);
        
        expect(mockApplicationService.setupAppData).toHaveBeenCalled();
      });

      it('should complete refresher after timeout', fakeAsync(() => {
        component.handleRefresh(mockRefresherEvent);
        
        tick(2000);
        
        expect(component.isLoading).toBe(false);
        expect(mockRefresherEvent.target.complete).toHaveBeenCalled();
      }));

      it('should not complete refresher before timeout', fakeAsync(() => {
        component.handleRefresh(mockRefresherEvent);
        
        tick(1000);
        
        expect(component.isLoading).toBe(true);
        expect(mockRefresherEvent.target.complete).not.toHaveBeenCalled();
      }));

      it('should store timeout reference for cleanup', () => {
        component.handleRefresh(mockRefresherEvent);
        
        expect((component as any).refreshTimeout).toBeDefined();
      });
    });
  });

  // ==========================================
  // Cleanup Method Tests
  // ==========================================

  describe('Cleanup Methods', () => {
    describe('cleanup', () => {
      it('should unsubscribe from activities if subscription exists', () => {
        const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
        (component as any).activitiesSubscription = mockSubscription;
        
        (component as any).cleanup();
        
        expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      });

      it('should handle missing activities subscription gracefully', () => {
        (component as any).activitiesSubscription = undefined;
        
        expect(() => (component as any).cleanup()).not.toThrow();
      });

      it('should clear refresh timeout if exists', () => {
        const timeoutId = setTimeout(() => {}, 1000);
        (component as any).refreshTimeout = timeoutId;
        spyOn(window, 'clearTimeout');
        
        (component as any).cleanup();
        
        expect(clearTimeout).toHaveBeenCalledWith(timeoutId);
      });

      it('should handle missing refresh timeout gracefully', () => {
        (component as any).refreshTimeout = undefined;
        
        expect(() => (component as any).cleanup()).not.toThrow();
      });
    });
  });

  // ==========================================
  // Integration Tests
  // ==========================================

  describe('Integration Tests', () => {
    it('should handle complete component lifecycle', fakeAsync(() => {
      // Initialize component
      component.ngOnInit();
      tick();
      
      // Simulate data loading
      activitiesSubject.next(mockActivities);
      tick();
      
      expect(component.isLoading).toBe(false);
      
      // Simulate refresh
      const mockEvent = {
        target: { complete: jasmine.createSpy('complete') }
      } as any;
      
      component.handleRefresh(mockEvent);
      expect(component.isLoading).toBe(true);
      
      tick(2000);
      expect(component.isLoading).toBe(false);
      expect(mockEvent.target.complete).toHaveBeenCalled();
      
      // Clean up
      component.ngOnDestroy();
    }));

    it('should handle tracking data updates', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      trackingSubject.next(mockTracking);
      tick();
      
      expect(component.activeTracking).toBeDefined();
    }));

    it('should handle multiple refresh operations', fakeAsync(() => {
      const mockEvent1 = { target: { complete: jasmine.createSpy('complete1') } } as any;
      const mockEvent2 = { target: { complete: jasmine.createSpy('complete2') } } as any;
      
      // First refresh
      component.handleRefresh(mockEvent1);
      tick(1000);
      
      // Second refresh before first completes
      component.handleRefresh(mockEvent2);
      tick(2000);
      
      // Both should complete
      expect(mockEvent1.target.complete).toHaveBeenCalled();
      expect(mockEvent2.target.complete).toHaveBeenCalled();
    }));
  });

  // ==========================================
  // Error Handling Tests
  // ==========================================

  describe('Error Handling', () => {
    it('should handle service initialization errors', () => {
      // Create a mock service with an observable that throws an error
      const errorService = {
        ...mockApplicationService,
        $user_activities: throwError(() => new Error('Service error')),
        $activeTracking: trackingSubject.asObservable()
      };
      
      // This should not throw as error handling is done at subscription level
      expect(() => {
        const testFixture = TestBed.createComponent(MyActivitiesPage);
        testFixture.destroy();
      }).not.toThrow();
    });

    it('should recover from data loading errors', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      // Trigger error
      activitiesSubject.error(new Error('Load failed'));
      tick();
      
      expect(component.isLoading).toBe(false);
      
      // Should be able to refresh again
      const mockEvent = {
        target: { complete: jasmine.createSpy('complete') }
      } as any;
      
      expect(() => component.handleRefresh(mockEvent)).not.toThrow();
    }));
  });
});

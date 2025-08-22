import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCardContent,
  IonItem,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  IonCardTitle,
  IonCardHeader,
  IonCard,
  IonLabel,
  IonSkeletonText,
  IonIcon,
} from '@ionic/angular/standalone';
import { ActivityListComponent } from 'src/app/components/activity-list/activity-list.component';
import { Observable, Subscription } from 'rxjs';
import { Activity } from 'src/app/core/models/activity.model';
import { ApplicationService } from 'src/app/core/services/application.service';
import { ActiveTrackingBarComponent } from 'src/app/components/active-tracking-bar/active-tracking-bar.component';
import { Tracking } from 'src/app/core/models/tracking.model';
import { I18nService } from 'src/app/core/services/i18n.service';
import { stopwatch } from 'ionicons/icons';
import { addIcons } from 'ionicons';

/**
 * MyActivitiesPage - User Activities Dashboard
 * 
 * This component serves as the main dashboard for displaying user activities.
 * It provides functionality for viewing personal activities, refreshing data,
 * and monitoring active tracking sessions.
 * 
 * Key Features:
 * - Display list of user activities
 * - Pull-to-refresh functionality
 * - Active tracking session display
 * - Loading state management
 * - Real-time activity updates
 * 
 * Dependencies:
 * - ApplicationService: Core application data and operations
 * - I18nService: Internationalization support
 * - ActivityListComponent: Displays activity list
 * - ActiveTrackingBarComponent: Shows active tracking status
 * 
 * @author BetterGS Development Team
 * @version 1.0.0
 * @since 2025
 */
@Component({
  selector: 'app-my-activities',
  templateUrl: 'my_activities.page.html',
  styleUrls: ['my_activities.page.scss'],
  imports: [
    IonCardHeader,
    IonCard,
    IonLabel,
    IonIcon,
    IonCardTitle,
    IonCardContent,
    IonSkeletonText,
    IonRefresherContent,
    IonRefresher,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    IonItem,
    ActivityListComponent,
    ActiveTrackingBarComponent,
  ],
})
export class MyActivitiesPage implements OnInit, OnDestroy {
  // ==========================================
  // Component State Properties
  // ==========================================

  /**
   * Loading state indicator for the component
   * Controls skeleton loading display and refresh operations
   */
  public isLoading = true;

  /**
   * Observable stream of user activities
   * Provides real-time updates of activities from the application service
   */
  public $activities: Observable<Activity[]>;

  /**
   * Observable stream of active tracking session
   * Monitors current tracking state for display in active tracking bar
   */
  public activeTracking: Observable<Tracking | void>;

  // ==========================================
  // Private Properties
  // ==========================================

  /**
   * Subscription to activities observable for cleanup
   */
  private activitiesSubscription?: Subscription;

  /**
   * Timeout reference for refresh operations
   */
  private refreshTimeout?: any;

  // ==========================================
  // Constructor & Initialization
  // ==========================================

  /**
   * MyActivitiesPage Constructor
   * 
   * Initializes the component with required services and sets up
   * observable streams for activities and tracking data.
   * 
   * @param appService - Application service for data operations
   * @param i18nService - Internationalization service
   */
  constructor(
    public appService: ApplicationService,
    public i18nService: I18nService
  ) {
    // Initialize observables
    this.$activities = this.appService.$user_activities;
    this.activeTracking = this.appService.$activeTracking;

    // Register required icons
    addIcons({
      stopwatch
    });
  }

  // ==========================================
  // Lifecycle Methods
  // ==========================================

  /**
   * Component initialization lifecycle method
   * 
   * Sets up activity subscription and handles loading states.
   * Subscribes to activities observable to manage loading state
   * and handle errors appropriately.
   */
  ngOnInit(): void {
    this.setupActivitySubscription();
  }

  /**
   * Component destruction lifecycle method
   * 
   * Cleans up subscriptions and timeouts to prevent memory leaks.
   * Called when component is destroyed.
   */
  ngOnDestroy(): void {
    this.cleanup();
  }

  // ==========================================
  // Data Management Methods
  // ==========================================

  /**
   * Sets up subscription to activities observable
   * 
   * Manages loading state based on activity data availability
   * and handles subscription errors with appropriate logging.
   * 
   * @private
   */
  private setupActivitySubscription(): void {
    this.activitiesSubscription = this.$activities.subscribe({
      next: (activities) => {
        this.isLoading = false;
        console.log('Activities loaded:', activities?.length || 0, 'items');
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading activities:', error);
        // TODO: Add user-friendly error notification
      },
    });
  }

  /**
   * Handles pull-to-refresh functionality
   * 
   * Triggers application data refresh and manages loading states.
   * Provides user feedback through loading indicator and completes
   * the refresh gesture after data reload.
   * 
   * @param event - Ionic refresher custom event
   */
  handleRefresh(event: RefresherCustomEvent): void {
    this.isLoading = true;
    
    // Trigger application data refresh
    this.appService.setupAppData();
    
    // Simulate refresh delay for better UX
    this.refreshTimeout = setTimeout(() => {
      this.isLoading = false;
      event.target.complete();
    }, 2000);
  }

  // ==========================================
  // Cleanup Methods
  // ==========================================

  /**
   * Performs component cleanup
   * 
   * Unsubscribes from observables and clears timeouts
   * to prevent memory leaks and pending operations.
   * 
   * @private
   */
  private cleanup(): void {
    // Unsubscribe from activities
    if (this.activitiesSubscription) {
      this.activitiesSubscription.unsubscribe();
    }

    // Clear any pending refresh timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
  }
}

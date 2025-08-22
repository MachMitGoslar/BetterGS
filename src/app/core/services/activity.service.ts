import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionChanges,
  Firestore,
  serverTimestamp,
  addDoc,
  setDoc,
  doc,
  DocumentReference,
  collectionSnapshots,
  deleteDoc,
} from '@angular/fire/firestore';
import { defaultIfEmpty, map, Observable, ReplaySubject, Subscription, tap } from 'rxjs';
import { Activity } from '../models/activity.model';
import { I18nService } from './i18n.service';

/**
 * ActivityService - Activity Data Management Service
 * 
 * This service is responsible for managing all activity-related data operations
 * in the BetterGS application. It provides a clean interface for CRUD operations
 * on activities and maintains real-time synchronization with Firestore.
 * 
 * Key Responsibilities:
 * - Activity CRUD operations (Create, Read, Update, Delete)
 * - Real-time activity data synchronization with Firestore
 * - User-specific activity data management
 * - Optimistic UI updates for better user experience
 * - Error handling and data consistency
 * 
 * Architecture:
 * - Uses ReplaySubject for reactive data streams
 * - Implements optimistic updates for immediate UI feedback
 * - Maintains local cache for performance optimization
 * - Provides both individual and collection-based operations
 * 
 * Data Flow:
 * - Components subscribe to $activities observable
 * - Service maintains internal _activities array
 * - Firestore operations update both local and remote state
 * - Real-time listeners keep data synchronized
 * 
 * @author BetterGS Development Team
 * @version 2.0.0
 * @since 2025-08-22
 * @Injectable
 */
@Injectable({
  providedIn: 'root',
})
export class ActivityService {

  // ========================================
  // PUBLIC OBSERVABLES
  // ========================================

  /**
   * Observable stream of activities for components to subscribe to
   * @description Provides real-time access to the activities collection
   * @public
   */
  public $activities = new ReplaySubject<Activity[]>(1);

  // ========================================
  // PRIVATE PROPERTIES
  // ========================================

  /**
   * Private array storing the current activities
   * @description Internal cache of activities for performance optimization
   * @private
   */
  private _activities: Activity[] = [];

  /**
   * Firestore database instance
   * @description Direct access to Firestore for database operations
   * @private
   */
  private firestore: Firestore = inject(Firestore);

  /**
   * Array to store component subscriptions
   * @description Manages all observable subscriptions to prevent memory leaks
   * @private
   */
  private subscription: Subscription[] = [];

  // ========================================
  // CONSTRUCTOR & DEPENDENCY INJECTION
  // ========================================

  /**
   * ActivityService Constructor
   * 
   * Initializes the service with required dependencies for activity management.
   * 
   * @param i18nService - Internationalization service for error messages
   */
  constructor(private i18nService: I18nService) {
  }

  // ========================================
  // DATA LOADING & SYNCHRONIZATION
  // ========================================

  /**
   * Initialize activities data stream from Firestore
   * 
   * Sets up real-time listener for activities collection changes and
   * automatically updates the local cache and observable stream.
   * 
   * @public
   * @returns {void}
   * @since 1.0.0
   */
  getActivities(): void {
    let subscription = collectionSnapshots(collection(this.firestore, 'activities')).subscribe({
      next: (snapshots) => {
        console.log('Activities collection changed:', snapshots);
        
        // Map Firestore document changes to Activity model instances
        this._activities = snapshots.map((snapshot) => {
          const id = snapshot.id;
          const data = snapshot.data({ serverTimestamps: 'estimate' });
          const activity = Activity.fromDB(id, data);
          activity.ref = snapshot.ref;
          return activity;
        });
        
        console.log('Mapped activities:', this._activities);
        
        // Notify subscribers of the updated activities list
        this.$activities.next(this._activities);
      },
      error: (error) => {
        console.error('Error fetching activities:', error);
        this.$activities.next([]);
      }
    });
    
    this.subscription.push(subscription);
  }

  // ========================================
  // DATA ACCESS METHODS
  // ========================================

  /**
   * Get current activities array
   * 
   * Provides direct access to the cached activities array.
   * Use this for immediate access without subscribing to the observable.
   * 
   * @public
   * @returns {Activity[]} Array of Activity objects
   * @since 1.0.0
   */
  get activities(): Activity[] {
    return this._activities;
  }

  /**
   * Find and return a specific activity by its ID
   * 
   * Searches the local cache for an activity with the specified ID.
   * 
   * @public
   * @param id - The unique identifier of the activity
   * @returns {Activity | undefined} The activity if found, undefined otherwise
   * @since 1.0.0
   */
  getActivityById(id: string): Activity | undefined {
    return this._activities.find((activity) => activity.id === id);
  }

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  /**
   * Add a new activity to the system
   * 
   * Creates a new activity in Firestore with server timestamps.
   * The activity is automatically added to the local cache through
   * the real-time listener.
   * 
   * @public
   * @param activity - The Activity object to add
   * @returns {Promise<void>} Promise that resolves when activity is created
   * @throws Will reject if Firestore operation fails
   * @since 1.0.0
   */
  async addActivity(activity: Activity): Promise<void> {
    const activitiesCollection = collection(this.firestore, 'activities');

    // Prepare activity data for Firestore
    const activityData = activity.toDB();
    activityData['createdAt'] = serverTimestamp();
    activityData['updatedAt'] = serverTimestamp();

    // Persist to Firestore
    try {
      await setDoc(doc(activitiesCollection, activity.id), activityData);
      console.log('Activity created successfully');
    } catch (error: any) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  /**
   * Update an existing activity in the system
   * 
   * Updates an existing activity in Firestore with server timestamp.
   * The local cache is automatically updated through the real-time listener.
   * 
   * @public
   * @param activity - The Activity object with updated data
   * @returns {Promise<void>} Promise that resolves when activity is updated
   * @throws Will reject if activity reference is missing or Firestore operation fails
   * @since 1.0.0
   */
  async updateActivity(activity: Activity): Promise<void> {
    // Prepare updated data for Firestore
    const activityData = activity.toDB();
    activityData['updatedAt'] = serverTimestamp();

    // Update Firestore document
    if (activity.ref) {
      try {
        await setDoc(activity.ref, activityData);
        console.log('Activity updated successfully');
      } catch (error: any) {
        console.error('Error updating activity:', error);
        throw error;
      }
    } else {
      throw new Error(this.i18nService.getTranslation('activity.error.updateFailed'));
    }
  }

  /**
   * Delete an activity from the system
   * 
   * Removes an activity from both local cache and Firestore.
   * Implements optimistic updates for immediate UI feedback with rollback on error.
   * 
   * @public
   * @param activityId - The ID of the activity to delete
   * @returns {Promise<void>} Promise that resolves when activity is deleted
   * @throws Will reject if activity not found or Firestore operation fails
   * @since 1.0.0
   */
  async deleteActivity(activityId: string): Promise<void> {
    const activityIndex = this._activities.findIndex(
      (activity) => activity.id === activityId
    );

    if (activityIndex === -1) {
      throw new Error(this.i18nService.getTranslation('activity.error.notFound'));
    }

    const activity = this._activities[activityIndex];

    // Optimistically update local state
    this._activities.splice(activityIndex, 1);
    this.$activities.next(this._activities);

    try {
      // Delete from Firestore
      if (activity.ref) {
        await deleteDoc(activity.ref);
      } else {
        // If no ref, use the collection reference
        const activitiesCollection = collection(this.firestore, 'activities');
        const activityDoc = doc(activitiesCollection, activityId);
        await deleteDoc(activityDoc);
      }

      console.log('Activity deleted successfully');
    } catch (error: any) {
      // Revert local state on error
      this._activities.splice(activityIndex, 0, activity);
      this.$activities.next(this._activities);

      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  // ========================================
  // USER-SPECIFIC OPERATIONS
  // ========================================

  /**
   * Get activities for a specific user
   * 
   * Retrieves user-specific activity data including tracking information
   * such as time spent and active status for each activity.
   * 
   * @public
   * @param user_id - The ID of the user to get activities for
   * @returns {Observable<Activity[]>} Stream of user-specific activities
   * @since 1.0.0
   */
  getActivitiesByUser(user_id: string): Observable<Activity[]> {
    const activitiesCollection = collection(
      this.firestore,
      'user_profile',
      user_id,
      'activities'
    );
    const changes = collectionSnapshots(activitiesCollection);

    return changes.pipe(
      map((change) => {
        console.log('Activities for user changed:', change);
        console.log('Activities for user:', this._activities);
        
        change.map((doc) => {
          const data = doc.data();
          
          this._activities.map((activity) => {
            if (activity.id === doc.id) {
              activity.ref = doc.ref; // Update reference to the document
              activity.timeSpend = data['duration'] || 0; // Default to 0 if not provided
              activity.is_active = data['is_active'] || false; // Default to false if not provided
            }
          });
        });
        
        return this._activities;
      })
    );
  }

  // ========================================
  // LIFECYCLE MANAGEMENT
  // ========================================

  /**
   * Clean up service resources
   * 
   * Unsubscribes from all active subscriptions to prevent memory leaks.
   * Should be called when the service is no longer needed.
   * 
   * @public
   * @returns {void}
   * @since 1.0.0
   */
  destroy(): void {
    for (const subscription of this.subscription) {
      subscription.unsubscribe();
    }
    console.log('ActivityService subscription destroyed');
  }

}

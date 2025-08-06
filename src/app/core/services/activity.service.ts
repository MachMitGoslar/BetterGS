import { inject, Injectable } from '@angular/core';
import { collection, collectionChanges, Firestore, serverTimestamp, addDoc, setDoc, doc, DocumentReference, collectionSnapshots, deleteDoc } from '@angular/fire/firestore';
import { defaultIfEmpty, map, Observable, ReplaySubject, tap } from 'rxjs';
import { Activity } from '../models/activity.model';
import { NotificationService } from './notification.service';
import { I18nService } from './i18n.service';

/**
 * Service responsible for managing activities in the application.
 * Handles CRUD operations and real-time synchronization with Firestore.
 */
@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  /** Observable stream of activities for components to subscribe to */
  public $activities = new ReplaySubject<Activity[]>(1);
  
  /** Private array storing the current activities */
  private _activities: Activity[] = [];



  /**
   * Constructor initializes the service and sets up real-time listener
   * for activities collection changes from Firestore.
   */
  constructor(
    private notificationService: NotificationService,
    private i18nService: I18nService,
    private firestore: Firestore
  ) {
    // Subscribe to real-time changes in the activities collection
    collectionSnapshots(collection(this.firestore, 'activities')).subscribe((changes) => {
      // Map Firestore document changes to Activity model instances
      this._activities = changes.map(change => {
        const id = change.id;
        const data = change.data({ serverTimestamps: 'estimate' });
        const activity = Activity.fromDB(id, data);
        activity.ref = change.ref;
        return activity;
      });
      
      // Notify subscribers of the updated activities list
      this.$activities.next(this._activities);
    }, error => {
      this.$activities.next([]);
    });
  }

  /**
   * Getter for accessing the current activities array.
   * @returns Array of Activity objects
   */
  get activities(): Activity[] {
    return this._activities;
  }

  /**
   * Finds and returns a specific activity by its ID.
   * @param id - The unique identifier of the activity
   * @returns The activity if found, undefined otherwise
   */
  getActivityById(id: string): Activity | undefined {
    return this._activities.find(activity => activity.id === id);
  }

  /**
   * Adds a new activity to both local state and Firestore.
   * Updates the local array immediately for optimistic UI updates,
   * then persists to Firestore with server timestamps.
   * 
   * @param activity - The Activity object to add
   */
  async addActivity(activity: Activity): Promise<void> {
    const activitiesCollection = collection(this.firestore, 'activities');
    
    
    // Prepare activity data for Firestore
    const activityData = activity.toDB();
    activityData["createdAt"] = serverTimestamp();
    activityData["updatedAt"] = serverTimestamp();
    
    // Persist to Firestore
    try {

        await setDoc(doc(activitiesCollection, activity.id), activityData);
        this.notificationService.addNotification(this.i18nService.getTranslation('activity.success.created'), 'success');

    } catch (error: any) {
      this.notificationService.addNotification(this.i18nService.getTranslation('activity.error.creationFailed') + error, 'danger');
      return;
      
    }
  }

  /**
   * Updates an existing activity in both local state and Firestore.
   * Optimistically updates the local array, then persists changes to Firestore.
   * 
   * @param activity - The Activity object with updated data
   */
  async updateActivity(activity: Activity): Promise<void> {

      // Prepare updated data for Firestore
      const activityData = activity.toDB();
      activityData["updatedAt"] = serverTimestamp();
      
      // Update Firestore document
      if (activity.ref) {
        try {
          await setDoc(activity.ref, activityData);
          this.notificationService.addNotification(this.i18nService.getTranslation('activity.success.updated'), 'success');

        } catch (error: any) {
          this.notificationService.addNotification(this.i18nService.getTranslation('activity.error.updateFailed') + error, 'danger'); 
        }
      }
      else {

          this.notificationService.addNotification(this.i18nService.getTranslation('activity.error.updateFailed'), 'danger');

    }
  }

  /**
   * Deletes an activity from both local state and Firestore.
   * Optimistically removes from local array, then deletes from Firestore.
   * 
   * @param activityId - The ID of the activity to delete
   */
  async deleteActivity(activityId: string): Promise<void> {
    const activityIndex = this._activities.findIndex(activity => activity.id === activityId);
    
    if (activityIndex === -1) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('activity.error.notFound'), 
        'danger'
      );
      return;
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

      this.notificationService.addNotification(
        this.i18nService.getTranslation('activity.success.deleted'), 
        'success'
      );

    } catch (error: any) {
      // Revert local state on error
      this._activities.splice(activityIndex, 0, activity);
      this.$activities.next(this._activities);
      
      this.notificationService.addNotification(
        this.i18nService.getTranslation('activity.error.deleteFailed') + error, 
        'danger'
      );
      throw error;
    }
  }

  getActivitiesByUser(userRef: DocumentReference): Observable<Activity[]> {
    const activitiesCollection = collection(this.firestore, 'users', userRef.id, 'activities');
    const changes = collectionSnapshots(activitiesCollection);
    
    return changes.pipe(
      
      map(change => {
        change.map(doc => {
          const data = doc.data();
          this._activities.map(activity => {
            if (activity.id === doc.id) {
              activity.ref = doc.ref; // Update reference to the document
              activity.timeSpend = data["duration"] || 0; // Default to 0 if not provided
              activity.is_active = data["is_active"] || false; // Default to false if not provided
            }
          });
        });
        return this._activities;
      })
      
    )
  }
}

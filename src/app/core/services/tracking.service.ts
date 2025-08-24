import { inject, Injectable } from '@angular/core';
import { Tracking } from '../models/tracking.model';
import { groupBy, map, mergeMap, Observable, ReplaySubject } from 'rxjs';
import { NotificationService } from './notification.service';
import { I18nService } from './i18n.service';
import {
  collection,
  collectionSnapshots,
  doc,
  DocumentReference,
  Firestore,
  increment,
  Timestamp,
  writeBatch,
} from '@angular/fire/firestore';
import { Activity } from '../models/activity.model';
import {
  getDownloadURL,
  ref,
  Storage,
  StringFormat,
  uploadBytes,
  uploadString,
} from '@angular/fire/storage';
import { image } from 'ionicons/icons';
import { User } from '@angular/fire/auth';
import { LocalNotificationSchema } from '@capacitor/local-notifications';

/**
 * Interface for grouped activity trackings
 * @description Represents activity data with associated tracking sessions
 */
export interface ActivtiyTrackings {
  activityId: string;
  activityName: string;
  activcityRef: DocumentReference;
  activityIcon: string;
  trackings: Tracking[];
}

/**
 * TrackingService - Activity Tracking Management Service
 *
 * This service handles all tracking-related operations in the BetterGS application,
 * including starting/stopping tracking sessions, saving tracking data to Firestore,
 * and managing tracking-related media uploads.
 *
 * Key Responsibilities:
 * - Activity tracking session management (start/stop)
 * - Tracking data persistence to Firestore
 * - Image upload for tracking sessions
 * - Local notification scheduling for active tracking
 * - User statistics aggregation (total time, tracking count)
 * - Activity-specific tracking data retrieval
 *
 * Architecture:
 * - Integrates with Firestore for data persistence
 * - Uses Firebase Storage for image uploads
 * - Implements batch operations for data consistency
 * - Manages local notifications for user engagement
 * - Provides reactive data streams for real-time updates
 *
 * Data Flow:
 * - Components call start/stop tracking methods
 * - Service manages tracking state and timestamps
 * - Data is persisted using batch operations
 * - Statistics are automatically updated
 * - Local notifications keep users informed
 *
 * @author BetterGS Development Team
 * @version 2.0.0
 * @since 2025-08-22
 * @Injectable
 */
@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  // ========================================
  // PUBLIC OBSERVABLES
  // ========================================

  /**
   * Observable stream of tracking sessions
   * @description Provides real-time access to tracking data
   * @public
   */
  public $trackings = new ReplaySubject<Tracking[]>(1);

  // ========================================
  // PUBLIC PROPERTIES
  // ========================================

  /**
   * Currently active tracking session
   * @description Reference to the current tracking session if any
   * @public
   */
  public activeTracking: Tracking | undefined;

  // ========================================
  // PRIVATE PROPERTIES
  // ========================================

  /**
   * Private array storing tracking sessions
   * @description Internal cache of tracking data
   * @private
   */
  private _trackings: Tracking[] = [];

  /**
   * Notification service for user feedback
   * @description Injected service for managing notifications
   * @private
   */
  private notificationService = inject(NotificationService);

  /**
   * Internationalization service
   * @description Injected service for translations
   * @private
   */
  private i18nService = inject(I18nService);

  /**
   * Firestore database instance
   * @description Injected service for database operations
   * @private
   */
  private firestore = inject(Firestore);

  /**
   * Firebase Storage instance
   * @description Injected service for file storage operations
   * @private
   */
  private storage = inject(Storage);

  // ========================================
  // CONSTRUCTOR & INITIALIZATION
  // ========================================

  /**
   * TrackingService Constructor
   *
   * Initializes the service with empty tracking data and sets up
   * the initial state for tracking management.
   */
  constructor() {
    // Initialize tracking data
    this._trackings = [];
    this.$trackings.next(this._trackings);
  }

  // ========================================
  // DATA RETRIEVAL METHODS
  // ========================================

  /**
   * Get tracking sessions for a specific activity
   *
   * Retrieves all tracking sessions for a given activity and user,
   * sorted by start date in descending order (most recent first).
   *
   * @public
   * @param user - The user ID to get trackings for
   * @param activityRef - Reference to the activity document
   * @returns {Observable<Tracking[]>} Stream of tracking sessions
   * @since 1.0.0
   */
  getTrackingsByActivity(
    user: string,
    activityRef: DocumentReference
  ): Observable<Tracking[]> {
    return collectionSnapshots(
      collection(
        this.firestore,
        'user_profile',
        user,
        'activities',
        activityRef.id,
        'trackings'
      )
    ).pipe(
      map((docs) => {
        return docs
          .map((doc) => {
            const data = doc.data();
            const tracking = Tracking.fromDBData(doc.id, data);
            return tracking;
          })
          .sort((b, a) => {
            return (
              (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0)
            );
          });
      })
    );
  }

  // ========================================
  // TRACKING SESSION MANAGEMENT
  // ========================================

  /**
   * Start tracking an activity
   *
   * Initiates a new tracking session for the specified activity and user.
   * Schedules local notifications to remind user about active tracking.
   *
   * @public
   * @param activity - The activity to start tracking
   * @param user - The user who is starting the tracking
   * @returns {Tracking} The newly created tracking session
   * @since 1.0.0
   */
  startTracking(activity: Activity, user: User): Tracking {
    const notifications: LocalNotificationSchema[] = [
      {
        id: 0,
        title: this.i18nService.getTranslation(
          'tracking.localNotifications.startTracking'
        ),
        body: 'Dein Tracking für ' + activity.title + ' läuft noch.',
        schedule: { at: new Date(Date.now() + 60 * 1000) }, // Schedule for 1 minute later
      },
    ];

    this.notificationService.scheduleLocalNotifications(notifications);

    return Tracking.startTracking(
      activity.ref!,
      doc(this.firestore, 'users', user.uid)
    );
  }

  /**
   * Stop tracking session
   *
   * Ends the current tracking session by setting end date and
   * marking it as inactive. Validates required references before stopping.
   *
   * @public
   * @param tracking - The tracking session to stop
   * @returns {void}
   * @throws Will throw error if user or activity reference is missing
   * @since 1.0.0
   */
  stopTracking(tracking: Tracking): void {
    if (tracking.userRef === undefined || tracking.userRef === null) {
      throw new Error(
        this.i18nService.getTranslation('tracking.error.userRefRequired')
      );
    }

    if (tracking.activityRef === undefined || tracking.activityRef === null) {
      throw new Error(
        this.i18nService.getTranslation('tracking.error.activityRefRequired')
      );
    }

    tracking.endDate = new Date();
    tracking.is_active = false;
  }

  // ========================================
  // DATA PERSISTENCE
  // ========================================

  /**
   * Save tracking data to Firestore
   *
   * Persists tracking session data to Firestore using batch operations
   * for consistency. Updates user statistics and activity duration.
   *
   * @public
   * @param tracking - The tracking session to save
   * @returns {void}
   * @throws Will throw error if user or activity reference is missing
   * @since 1.0.0
   */
  saveToDB(tracking: Tracking): void {
    if (tracking.userRef === undefined || tracking.userRef === null) {
      throw new Error(
        this.i18nService.getTranslation('tracking.error.userRefRequired')
      );
    }

    if (tracking.activityRef === undefined || tracking.activityRef === null) {
      throw new Error(
        this.i18nService.getTranslation('tracking.error.activityRefRequired')
      );
    }

    const batch = writeBatch(this.firestore);

    // Save tracking session document
    batch.set(
      doc(
        this.firestore,
        'user_profile',
        tracking.userRef.id,
        'activities',
        tracking.activityRef!.id,
        'trackings',
        tracking.id
      ),
      {
        id: tracking.id,
        startDate: tracking.startDate
          ? Timestamp.fromDate(tracking.startDate)
          : null,
        endDate: tracking.endDate ? Timestamp.fromDate(tracking.endDate) : null,
        notes: tracking.notes,
        duration: tracking.duration,
        imageUrl: tracking.imageUrl || null,
        activityRef: tracking.activityRef ? tracking.activityRef : null,
        userRef: tracking.userRef ? tracking.userRef : null,
      }
    );

    // Update activity duration statistics
    batch.set(
      doc(
        this.firestore,
        'user_profile',
        tracking.userRef.id,
        'activities',
        tracking.activityRef.id
      ),
      {
        duration: increment(tracking.duration),
      },
      { merge: true }
    );

    // Update user global statistics
    batch.set(
      doc(this.firestore, 'user_profile', tracking.userRef.id),
      {
        trackedTime: increment(tracking.duration),
        total_trackings: increment(1),
      },
      { merge: true }
    );

    // Commit batch operation
    batch
      .commit()
      .then(() => {
        console.log('Tracking data saved successfully');
      })
      .catch((error) => {
        console.error('Error saving tracking data: ', error);
        throw error;
      });
  }

  // ========================================
  // IMAGE UPLOAD MANAGEMENT
  // ========================================

  /**
   * Upload image for tracking session
   *
   * Uploads a base64 encoded image to Firebase Storage and associates
   * it with the tracking session. Updates tracking object with image URL.
   *
   * @public
   * @param file_string - Base64 encoded image string
   * @param tracking - The tracking session to associate the image with
   * @param metadata - Optional metadata for the uploaded file
   * @returns {Promise<string>} Promise that resolves to the image download URL
   * @throws Will reject if tracking references are missing or upload fails
   * @since 1.0.0
   */
  uploadImage(
    file_string: string,
    tracking: Tracking,
    metadata: any
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!tracking.userRef || !tracking.activityRef) {
        reject(
          new Error(
            this.i18nService.getTranslation('tracking.error.referencesRequired')
          )
        );
        return;
      }

      const storageRef = ref(
        this.storage,
        `user_profile/${tracking.userRef.id}/activities/${tracking.activityRef.id}/trackings/${tracking.id}`
      );

      console.log('Uploading image to:', storageRef.fullPath);

      uploadString(storageRef, file_string, StringFormat.DATA_URL, metadata)
        .then((snapshot) => {
          getDownloadURL(snapshot.ref)
            .then((url) => {
              tracking.imageUrl = url;
              resolve(url);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

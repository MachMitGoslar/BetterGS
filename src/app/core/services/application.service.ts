import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionCount,
  collectionData,
  collectionGroup,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
} from '@angular/fire/firestore';
import {
  Auth,
  confirmPasswordReset,
  deleteUser,
  sendPasswordResetEmail,
  signOut,
} from '@angular/fire/auth';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
  Storage,
  deleteObject,
  listAll,
} from '@angular/fire/storage';
import { EMPTY, map, Observable, ReplaySubject, Subscription } from 'rxjs';
import { Activity } from '../models/activity.model';
import { Tracking } from '../models/tracking.model';
import { UserService } from './user.service';
import { ActivityService } from './activity.service';
import { TrackingService } from './tracking.service';
import { NotificationService } from './notification.service';
import { I18nService } from './i18n.service';
import { LocalNotifications } from '@capacitor/local-notifications';

import { User } from '@angular/fire/auth';
import { UserPublicProfile } from '../models/user_public_profile.model';
import { UserPrivateProfile } from '../models/user_private_profile.model';

/**
 * ApplicationService - Main Application Service
 *
 * This service acts as the primary orchestrator for the BetterGS application,
 * coordinating between different services and providing a unified interface
 * for common operations with proper notification handling.
 *
 * Key Responsibilities:
 * - User authentication and profile management
 * - Activity management with unified notification handling
 * - Tracking session management
 * - Permission management
 * - File upload coordination
 * - Notification orchestration
 *
 * Architecture:
 * - Acts as a facade pattern over individual services
 * - Ensures consistent error handling and user feedback
 * - Manages application-wide state and user sessions
 * - Provides simplified interface for UI components
 *
 * @author BetterGS Development Team
 * @version 2.0.0
 * @since 2025-08-22
 * @Injectable
 */
@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  // ========================================
  // PUBLIC OBSERVABLES
  // ========================================

  /**
   * Observable stream of all activities
   * @description Provides real-time access to the activities collection
   */
  $activities!: Observable<Activity[]>;

  /**
   * Observable stream of user-specific activities
   * @description Provides activities filtered by current user
   */
  $user_activities: Observable<Activity[]> = EMPTY;

  /**
   * Observable stream of current user
   * @description Provides real-time access to authentication state
   */
  $currentUser: Observable<User | null>;

  /**
   * Observable stream of active tracking session
   * @description Provides real-time access to current tracking state
   */
  $activeTracking = new ReplaySubject<Tracking | undefined>(1);

  // ========================================
  // PUBLIC PROPERTIES
  // ========================================

  /**
   * Firestore database instance
   * @description Direct access to Firestore for advanced operations
   */
  public firestore: Firestore = inject(Firestore);

  // ========================================
  // PRIVATE PROPERTIES
  // ========================================

  /**
   * Current authenticated user reference
   * @description Internal reference to the current user
   * @private
   */
  _currentUser: User | undefined;

  /**
   * Current active tracking session
   * @description Internal reference to active tracking
   * @private
   */
  _activeTracking?: Tracking;

  // ========================================
  // ADDITIONAL PROPERTIES
  // ========================================

  /**
   * Notification permissions status
   * @description Tracks whether notifications are allowed by the user
   */
  notificationsAllowed: boolean = false;

  /**
   * User state subscription
   * @description Internal subscription for user state changes
   * @private
   */
  private user_subscription!: Subscription;

  /**
   * Camera permission status
   * @description Tracks camera permission state for image capture
   */
  public cameraPermissionGranted: boolean = false;

  /**
   * Photo library permission status
   * @description Tracks photo library access permission
   */
  public photoLibraryPermissionGranted: boolean = false;

  /**
   * Notification enablement status
   * @description Tracks whether notifications are currently enabled
   */
  public notificationsEnabled: boolean = false;

  // ========================================
  // CONSTRUCTOR & INITIALIZATION
  // ========================================

  /**
   * ApplicationService Constructor
   *
   * Initializes the service with required dependencies and sets up
   * initial subscriptions for user state and activities.
   *
   * @param usrSrv UserService - User authentication and profile management
   * @param activityService ActivityService - Activity data operations
   * @param trackingService TrackingService - Tracking session management
   * @param notificationService NotificationService - User notification handling
   * @param i18nService I18nService - Internationalization service
   * @param auth Auth - Firebase authentication instance
   * @param storage Storage - Firebase storage instance
   */

  public usrSrv = inject(UserService);
  public activityService = inject(ActivityService);
  public trackingService = inject(TrackingService);
  public notificationService = inject(NotificationService);
  public i18nService = inject(I18nService);
  public auth = inject(Auth);
  public storage = inject(Storage);

  constructor() {
    this.$currentUser = this.usrSrv.$currentUser as Observable<User | null>;
    this.initializeService();
  }

  /**
   * Initialize service state and subscriptions
   *
   * Sets up initial data streams and user state subscriptions.
   * This method is called automatically during service construction.
   *
   * @private
   * @returns {void}
   * @since 2.0.0
   */
  private initializeService(): void {
    // Initialize activities stream
    this.$activities = this.activityService.$activities;

    // Set up user state subscription
    this.user_subscription = this.usrSrv.$currentUser.subscribe((user) => {
      if (user && user !== null && user != this._currentUser) {
        this._currentUser = user;
        console.log(
          'Calling the appSetup for current user:',
          this._currentUser
        );
        this.setupAppData();
      } else {
        this._currentUser = undefined;
      }
    });
  }

  // ========================================
  // APP SETUP & CONFIGURATION
  // ========================================

  /**
   * Set up application data for authenticated user
   *
   * Initializes user-specific data streams and checks device permissions.
   * This method is called automatically when a user logs in.
   *
   * @public
   * @returns {void}
   * @since 1.0.0
   */
  public setupAppData(): void {
    console.log('Getting activities');
    this.activityService.getActivities();

    if (this._currentUser) {
      this.$user_activities = this.activityService.getActivitiesByUser(
        this._currentUser.uid
      ) as Observable<Activity[]>;
    }

    // Check notification permissions
    LocalNotifications.checkPermissions().then((result) => {
      console.log('Notification permissions:', result);
      if (result.display === 'granted') {
        console.log('Notification permissions granted');
        this.notificationsEnabled = true;
      }
    });
  }

  /**
   * Request device permissions from user
   *
   * Requests notification permissions and updates the application state
   * based on user response. Provides user feedback through notifications.
   *
   * @public
   * @returns {void}
   * @since 1.0.0
   */
  askForPermissions(): void {
    LocalNotifications.requestPermissions().then((value) => {
      console.log('Notification permissions after request:', value);
      if (value.display === 'granted') {
        this.notificationsAllowed = true;
        this.notificationService.addNotification(
          this.i18nService.getTranslation('success.notifications.allowed'),
          'success'
        );
      } else {
        this.notificationsAllowed = false;
        console.log('Notification permissions denied');
        this.notificationService.addNotification(
          this.i18nService.getTranslation('error.notifications.denied'),
          'warning'
        );
      }
    });
  }

  // ========================================
  // TRACKING MANAGEMENT
  // ========================================

  /**
   * Start tracking an activity
   *
   * Initiates a new tracking session for the specified activity.
   * This is a convenience method that delegates to startTrackingActivity.
   *
   * @public
   * @param activity - The activity to start tracking
   * @returns {void}
   * @since 1.0.0
   */
  startTracking(activity: Activity): void {
    this.startTrackingActivity(activity);
  }

  /**
   * Stop current tracking session
   *
   * Ends the active tracking session and saves the tracking data.
   * This is a convenience method that delegates to stopTrackingActivity.
   *
   * @public
   * @returns {void}
   * @since 1.0.0
   */
  stopTracking(): void {
    this.stopTrackingActivity();
  }

  /**
   * Get recent tracking sessions for an activity
   *
   * Retrieves the most recent tracking sessions for a specified activity.
   * Validates user authentication and activity availability before fetching.
   *
   * @public
   * @param activity - The activity to get tracking sessions for
   * @returns {Observable<Tracking[]>} Stream of recent tracking sessions
   * @throws Will show error notification if user not logged in or activity unavailable
   * @since 1.0.0
   */
  getRecentTrackngsByActivity(activity: Activity): Observable<Tracking[]> {
    if (!this.usrSrv.currentUser) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'),
        'warning'
      );
      return new ReplaySubject<Tracking[]>(1);
    }

    if (!activity || !activity.ref) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.activity.not.available'),
        'danger'
      );
      return new ReplaySubject<Tracking[]>(1);
    }

    return this.trackingService.getTrackingsByActivity(
      this.usrSrv.currentUser.uid,
      activity.ref
    );
  }

  // ========================================
  // USER MANAGEMENT & AUTHENTICATION
  // ========================================

  /**
   * Register anonymous user with email and password
   *
   * Converts an anonymous user account to a permanent account with
   * email and password credentials. Provides user feedback on success/failure.
   *
   * @public
   * @param email - User's email address
   * @param password - User's chosen password
   * @returns {void}
   * @throws Will show error notification if registration fails
   * @since 1.0.0
   */
  registerUserWithEmail(email: string, password: string): void {
    if (this._currentUser && this._currentUser.isAnonymous) {
      this.usrSrv
        .registerUserWithEmail(email, password)
        .then((userCredential) => {
          this.notificationService.addNotification(
            this.i18nService.getTranslation('success.user.registered'),
            'success'
          );
        })
        .catch((error) => {
          this.notificationService.addNotification(
            this.i18nService.getTranslation('error.user.registration') +
              ': ' +
              error.message,
            'danger'
          );
        });
    } else {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'),
        'warning'
      );
    }
  }

  /**
   * Change user password
   *
   * Updates the current user's password with a new one.
   * Validates user authentication before attempting password change.
   *
   * @public
   * @param newPassword - The new password to set
   * @returns {void}
   * @throws Will show error notification if user not logged in or password change fails
   * @since 1.0.0
   */
  changePassword(newPassword: string): void {
    if (this._currentUser && this._currentUser) {
      this.usrSrv
        .changePassword(newPassword)
        .then(() => {
          this.notificationService.addNotification(
            this.i18nService.getTranslation('success.password.changed'),
            'success'
          );
        })
        .catch((error) => {
          this.notificationService.addNotification(
            this.i18nService.getTranslation('error.password.change') +
              ': ' +
              error.message,
            'danger'
          );
        });
    } else {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'),
        'warning'
      );
    }
  }

  /**
   * Update user profile information
   *
   * Updates the current user's public profile with the provided data.
   * Uses Firestore merge to preserve existing fields not being updated.
   *
   * @public
   * @param profile_data - Partial user profile data to update
   * @returns {Promise<void>} Promise that resolves when update is complete
   * @throws Will reject if user not logged in or update fails
   * @since 2.0.0
   */
  async updateUserProfile(
    profile_data: Partial<UserPublicProfile>
  ): Promise<void> {
    /**** Update User Public Profile */
    if (!this._currentUser) {
      return Promise.reject(
        new Error(this.i18nService.getTranslation('error.no.user.logged.in'))
      );
    } else {
      try {
        console.log('Updating user profile with data:', profile_data);
        const userDocRef = doc(
          this.firestore,
          'user_profile',
          this._currentUser?.uid
        );
        await setDoc(userDocRef, profile_data, { merge: true });
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(
          new Error(
            this.i18nService.getTranslation(
              'Failed to update user public profile'
            )
          )
        );
      }
    }
  }
  // ========================================
  // FILE UPLOAD & STORAGE MANAGEMENT
  // ========================================

  /**
   * Upload user profile image to Firebase Storage
   *
   * Uploads a base64 encoded image string to Firebase Storage under the user's
   * profile directory. Generates a unique filename using the current timestamp
   * and the provided file name.
   *
   * @public
   * @param base64String - Base64 encoded image string
   * @param fileName - Name of the file to be saved
   * @param metadata - Optional metadata for the file
   * @returns {Promise<string>} Promise resolving to the download URL of the uploaded image
   * @throws Will reject if no user is logged in or if upload fails
   * @since 1.0.0
   */
  async uploadUserProfileImage(
    base64String: string,
    fileName: string,
    metadata?: any
  ): Promise<string> {
    if (!this._currentUser) {
      throw new Error(
        this.i18nService.getTranslation('error.no.user.logged.in')
      );
    }

    try {
      const storage = getStorage();
      const imageRef = ref(
        storage,
        `users/${this._currentUser.uid}/profile/${Date.now()}_${fileName}`
      );

      // Upload the base64 string
      const uploadResult = await uploadString(
        imageRef,
        base64String,
        'data_url',
        metadata
      );

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error(
        this.i18nService.getTranslation('profile.error.uploadFailed')
      );
    }
  }

  // ========================================
  // STATISTICS & METRICS
  // ========================================

  /**
   * Get count of active activities for current user
   *
   * Returns an observable stream of the number of activities
   * in the current user's collection.
   *
   * @public
   * @returns {Observable<number>} Stream of activity count
   * @since 1.0.0
   */
  get active_activities(): Observable<number> {
    if (this._currentUser) {
      return collectionCount(
        collection(this.firestore, this._currentUser!.uid, 'activities')
      ).pipe(map((count) => count || 0));
    } else {
      return new ReplaySubject<number>(1);
    }
  }

  // ========================================
  // AUTHENTICATION ACTIONS
  // ========================================

  /**
   * Log out current user
   *
   * Performs complete logout including service cleanup and user feedback.
   * Destroys activity service, clears tracking state, and signs out from Firebase.
   *
   * @public
   * @returns {void}
   * @since 1.0.0
   */
  logout(): void {
    if (this._currentUser) {
      this.activityService.destroy();
      this.$activeTracking.next(undefined);
      signOut(this.auth)
        .then(() => {
          console.log('User logged out successfully');
          this.notificationService.addNotification(
            this.i18nService.getTranslation('success.logged.out'),
            'success'
          );
        })
        .catch((error) => {
          console.error('Error logging out user:', error);
          this.notificationService.addNotification(
            this.i18nService.getTranslation('error.logout') +
              ': ' +
              error.message,
            'danger'
          );
        });
    } else {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.to.logout'),
        'warning'
      );
    }
  }

  /**
   * Login user with email and password
   *
   * Authenticates user using email and password credentials.
   * Provides user feedback on success or failure.
   *
   * @public
   * @param email - User's email address
   * @param password - User's password
   * @returns {Promise<void>} Promise that resolves when login is complete
   * @since 1.0.0
   */
  loginWithEmail(email: string, password: string): Promise<void> {
    return this.usrSrv
      .loginWithEmail(email, password)
      .then((userCredential) => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('success.login'),
          'success'
        );
      })
      .catch((error) => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('error.login') + ': ' + error.message,
          'danger'
        );
      });
  }

  /**
   * Login user anonymously
   *
   * Creates an anonymous user session for guest access.
   * Provides user feedback on success or failure.
   *
   * @public
   * @returns {Promise<void>} Promise that resolves when anonymous login is complete
   * @since 1.0.0
   */
  loginAnonymously(): Promise<void> {
    return this.usrSrv
      .loginAnonymously()
      .then((userCredential) => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('success.anonymous.login'),
          'success'
        );
      })
      .catch((error) => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('error.anonymous.login') +
            ': ' +
            error.message,
          'danger'
        );
        throw error;
      });
  }

  /**
   * Reset user password via email
   *
   * Sends a password reset email to the user's registered email address.
   * Requires user to be logged in.
   *
   * @public
   * @param email - Email address to send reset link to
   * @returns {Promise<void>} Promise that resolves when reset email is sent
   * @throws Will reject if no user is logged in
   * @since 1.0.0
   */
  resetPassword(email: string): Promise<void> {
    if (!this._currentUser) {
      return Promise.reject(
        new Error(this.i18nService.getTranslation('error.no.user.logged.in'))
      );
    }
    return sendPasswordResetEmail(this.auth, email);
  }

  /**
   * Create user account with email and password
   *
   * Creates a new user account with the provided email and password.
   * Uses the current user's display name or defaults to 'New User'.
   * Provides user feedback on success or failure.
   *
   * @public
   * @param email - User's email address
   * @param password - User's password
   * @returns {Promise<void>} Promise that resolves when the user is created
   * @throws Will reject if no user is logged in or if account creation fails
   * @since 1.0.0
   */
  createUserWithEmail(email: string, password: string): Promise<void> {
    if (!this._currentUser) {
      return Promise.reject(
        new Error(this.i18nService.getTranslation('error.no.user.logged.in'))
      );
    }

    return this.createUserWithEmailAndDisplayName(
      email,
      password,
      this._currentUser.displayName || 'New User'
    )
      .then
      // Success handled in createUserWithEmailAndDisplayName
      ()
      .catch((error) => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('error.account.creation') +
            ': ' +
            error.message,
          'danger'
        );
        throw error;
      });
  }

  /**
   * Create user account with email, password, and display name
   *
   * Creates user account and immediately sets the display name.
   * This method handles the signup flow properly to avoid race conditions.
   *
   * @public
   * @param email - User's email address
   * @param password - User's password
   * @param displayName - User's display name
   * @returns {Promise<void>} Promise that resolves when user is created
   * @throws Will reject if account creation fails
   * @since 2.0.0
   */
  async createUserWithEmailAndDisplayName(
    email: string,
    password: string,
    displayName: string
  ): Promise<void> {
    try {
      // Create the account and wait for completion
      await this.usrSrv.registerUserWithEmail(email, password, displayName);

      console.log('User created successfully with email:', email);

      this.notificationService.addNotification(
        this.i18nService.getTranslation('success.account.created'),
        'success'
      );
    } catch (error: any) {
      console.error('Error creating user:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.account.creation') +
          ': ' +
          error.message,
        'danger'
      );
      throw error;
    }
  }

  /**
   * Request notification permissions from device
   *
   * Requests local notification permissions and updates internal state
   * based on user's permission response.
   *
   * @public
   * @returns {Promise<void>} Promise that resolves when permission request is complete
   * @since 1.0.0
   */
  requestNotificationPermissions(): Promise<void> {
    LocalNotifications.requestPermissions().then((result) => {
      if (result.display === 'granted') {
        this.notificationsAllowed = true;
      } else if (result.display === 'denied') {
        this.notificationsAllowed = false;
      }
    });
    return Promise.resolve();
  }

  // ========================================
  // ACTIVITY MANAGEMENT WITH NOTIFICATIONS
  // ========================================

  /**
   * Create a new activity with proper notification handling
   *
   * Creates a new activity and provides user feedback on success or failure.
   * This method centralizes notification handling for activity creation.
   *
   * @public
   * @param activity - The activity to create
   * @returns {Promise<void>} Promise that resolves when activity is created
   * @throws Will reject if user not logged in or creation fails
   * @since 2.0.0
   */
  async createActivity(activity: Activity): Promise<void> {
    if (!this._currentUser) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'),
        'warning'
      );
      throw new Error(
        this.i18nService.getTranslation('error.no.user.logged.in')
      );
    }

    try {
      await this.activityService.addActivity(activity);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('activity.success.created'),
        'success'
      );
    } catch (error: any) {
      console.error('Error creating activity:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('activity.error.creationFailed') +
          ': ' +
          error.message,
        'danger'
      );
      throw error;
    }
  }

  /**
   * Update an existing activity with proper notification handling
   *
   * Updates an existing activity and provides user feedback on success or failure.
   * This method centralizes notification handling for activity updates.
   *
   * @public
   * @param activity - The activity to update
   * @returns {Promise<void>} Promise that resolves when activity is updated
   * @throws Will reject if user not logged in or update fails
   * @since 2.0.0
   */
  async updateActivity(activity: Activity): Promise<void> {
    if (!this._currentUser) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'),
        'warning'
      );
      throw new Error(
        this.i18nService.getTranslation('error.no.user.logged.in')
      );
    }

    try {
      await this.activityService.updateActivity(activity);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('activity.success.updated'),
        'success'
      );
    } catch (error: any) {
      console.error('Error updating activity:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('activity.error.updateFailed') +
          ': ' +
          error.message,
        'danger'
      );
      throw error;
    }
  }

  /**
   * Delete an activity with proper notification handling
   *
   * Deletes an existing activity and provides user feedback on success or failure.
   * This method centralizes notification handling for activity deletion.
   *
   * @public
   * @param activityId - The ID of the activity to delete
   * @returns {Promise<void>} Promise that resolves when activity is deleted
   * @throws Will reject if user not logged in or deletion fails
   * @since 2.0.0
   */
  async deleteActivity(activityId: string): Promise<void> {
    if (!this._currentUser) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'),
        'warning'
      );
      throw new Error(
        this.i18nService.getTranslation('error.no.user.logged.in')
      );
    }

    try {
      await this.activityService.deleteActivity(activityId);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('activity.success.deleted'),
        'success'
      );
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('activity.error.deleteFailed') +
          ': ' +
          error.message,
        'danger'
      );
      throw error;
    }
  }

  // ========================================
  // TRACKING OPERATIONS WITH NOTIFICATIONS
  // ========================================

  /**
   * Start tracking an activity with enhanced notification handling
   *
   * Initiates tracking for the specified activity. If another activity is already
   * being tracked, it will be stopped first. Provides comprehensive user feedback.
   *
   * @public
   * @param activity - The activity to start tracking
   * @returns {void}
   * @since 2.0.0
   */
  startTrackingActivity(activity: Activity): void {
    if (!this.usrSrv.currentUser) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'),
        'warning'
      );
      return;
    }

    if (!activity) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.activity.not.available'),
        'danger'
      );
      return;
    }

    try {
      if (this._activeTracking) {
        this.trackingService.stopTracking(this._activeTracking);
        this._activeTracking = undefined;
        this.$activeTracking.next(this._activeTracking);
        this.notificationService.addNotification(
          this.i18nService.getTranslation('success.tracking.stopped'),
          'success'
        );
      }

      this._activeTracking = this.trackingService.startTracking(
        activity,
        this.usrSrv.currentUser
      );
      this.$activeTracking.next(this._activeTracking);

      this.notificationService.addNotification(
        this.i18nService.getTranslation('success.tracking.started'),
        'success'
      );
    } catch (error: any) {
      console.error('Error starting tracking:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.tracking.start') +
          ': ' +
          error.message,
        'danger'
      );
    }
  }

  /**
   * Stop tracking with enhanced notification handling
   *
   * Stops the currently active tracking session and provides user feedback.
   * Validates that tracking is active before attempting to stop.
   *
   * @public
   * @returns {void}
   * @since 2.0.0
   */
  stopTrackingActivity(): void {
    if (!this.usrSrv.currentUser) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'),
        'warning'
      );
      return;
    }

    if (!this._activeTracking) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.tracking.not.available'),
        'danger'
      );
      return;
    }

    try {
      this.trackingService.stopTracking(this._activeTracking);
      this._activeTracking = undefined;
      this.$activeTracking.next(this._activeTracking);

      this.notificationService.addNotification(
        this.i18nService.getTranslation('success.tracking.stopped'),
        'success'
      );
    } catch (error: any) {
      console.error('Error stopping tracking:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.tracking.stop') +
          ': ' +
          error.message,
        'danger'
      );
    }
  }
}

import { inject, Injectable } from '@angular/core';
import {
  deleteDoc,
  doc,
  docSnapshots,
  Firestore,
  getDoc,
  serverTimestamp,
  setDoc,
  collection,
  collectionSnapshots,
  writeBatch,
  collectionGroup,
  getDocs,
} from '@angular/fire/firestore';
import {
  Auth,
  signInAnonymously,
  EmailAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  User as FirestoreUser,
  UserCredential,
  updatePassword,
  updateProfile,
  deleteUser,
  signInWithCredential,
} from '@angular/fire/auth';
import {
  ReplaySubject,
  Subscription,
  Observable,
  map,
  forkJoin,
  take,
} from 'rxjs';

import { User } from '@angular/fire/auth';
import { UserPrivateProfile } from '../models/user_private_profile.model';
import { UserPublicProfile } from '../models/user_public_profile.model';
import { ref } from '@angular/fire/storage';
import { create } from 'ionicons/icons';

/**
 * UserService - User Authentication and Profile Management Service
 *
 * This service handles all user-related operations in the BetterGS application,
 * including authentication, user profile management, and user data synchronization.
 * It manages both public and private user profiles with real-time synchronization.
 *
 * Key Responsibilities:
 * - User authentication (email/password, anonymous)
 * - User registration and account creation
 * - Profile management (public and private)
 * - Real-time user data synchronization
 * - User ranking and statistics
 * - Password management and security
 * - Account deletion and cleanup
 *
 * Architecture:
 * - Uses Firebase Authentication for secure user management
 * - Maintains separate public and private user profiles
 * - Implements real-time data streams for user state
 * - Handles automatic profile creation for new users
 * - Manages subscription cleanup for memory efficiency
 *
 * Data Models:
 * - UserPublicProfile: Public user information (name, stats, ranking)
 * - UserPrivateProfile: Private user information (email, settings, role)
 * - User: Firebase Authentication user object
 *
 * @author BetterGS Development Team
 * @version 2.0.0
 * @since 2025-08-22
 * @Injectable
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  // ========================================
  // PUBLIC OBSERVABLES
  // ========================================

  /**
   * Observable stream of current authenticated user
   * @description Provides real-time access to Firebase Auth user state
   * @public
   */
  public $currentUser = new ReplaySubject<User | null>(1);

  /**
   * Observable stream of current user's private profile
   * @description Provides real-time access to private user data (settings, role, etc.)
   * @public
   */
  public $currentUserPrivateProfile = new ReplaySubject<
    UserPrivateProfile | undefined
  >(1);

  /**
   * Observable stream of current user's public profile
   * @description Provides real-time access to public user data (name, stats, etc.)
   * @public
   */
  public $currentUserProfile = new ReplaySubject<UserPublicProfile | undefined>(
    1
  );

  // ========================================
  // PUBLIC PROPERTIES
  // ========================================

  /**
   * Current authenticated user reference
   * @description Direct access to the current Firebase Auth user
   * @public
   */
  public currentUser: User | undefined;

  /**
   * Current user's private profile data
   * @description Cached private profile for immediate access
   * @public
   */
  public _currentUserPrivateProfile: UserPrivateProfile | undefined;

  /**
   * Current user's public profile data
   * @description Cached public profile for immediate access
   * @public
   */
  public _currentUserProfile: UserPublicProfile | undefined;

  /**
   * Array to store active subscriptions
   * @description Manages all observable subscriptions to prevent memory leaks
   * @public
   */
  public subscriptions: Subscription[] = [];

  /**
   * User creation state flag
   * @description Indicates if a user creation operation is in progress
   * @public
   */
  public creatingUser: boolean = false;

  /**
   * Firestore database instance
   * @description Direct access to Firestore for database operations
   * @public
   */
  public firestore: Firestore = inject(Firestore);

  /**
   * Firebase Authentication instance
   * @description Direct access to Firebase Auth for authentication operations
   * @public
   */
  public auth: Auth = inject(Auth);

  // ========================================
  // CONSTRUCTOR & INITIALIZATION
  // ========================================

  /**
   * UserService Constructor
   *
   * Initializes the service and sets up Firebase Auth state listener.
   * Automatically manages user profile synchronization when auth state changes.
   */
  constructor() {
    this.initializeAuthStateListener();
  }

  /**
   * Initialize Firebase Auth state listener
   *
   * Sets up real-time monitoring of authentication state changes and
   * automatically manages user profile subscriptions.
   *
   * @private
   * @returns {void}
   * @since 2.0.0
   */
  private initializeAuthStateListener(): void {
    this.auth.onAuthStateChanged((fb_user) => {
      console.log('Auth state changed:', fb_user);

      if (fb_user) {
        this.handleUserSignIn(fb_user);
      } else {
        this.handleUserSignOut();
      }
    });
  }

  /**
   * Handle user sign-in operations
   *
   * Sets up user profile subscriptions and creates profiles if they don't exist.
   *
   * @private
   * @param fb_user - The Firebase Auth user object
   * @returns {void}
   * @since 2.0.0
   */
  private handleUserSignIn(fb_user: User): void {
    // Clean up old subscriptions if user has changed
    if (!this.currentUser || this.currentUser.uid !== fb_user.uid) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions = [];
    }

    this.$currentUser.next(fb_user);
    this.currentUser = fb_user;

    // Set up private profile subscription
    this.setupPrivateProfileSubscription(fb_user);

    // Set up public profile subscription
    this.setupPublicProfileSubscription(fb_user);
  }

  /**
   * Handle user sign-out operations
   *
   * Cleans up all subscriptions and resets user state.
   *
   * @private
   * @returns {void}
   * @since 2.0.0
   */
  private handleUserSignOut(): void {
    this.$currentUser.next(null);
    this.currentUser = undefined;
    this._currentUserPrivateProfile = undefined;
    this.$currentUserPrivateProfile.next(undefined);
    this._currentUserProfile = undefined;
    this.$currentUserProfile.next(undefined);
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  /**
   * Set up private profile subscription
   *
   * Creates real-time subscription for user's private profile data.
   * Automatically creates profile if it doesn't exist.
   *
   * @private
   * @param user - The Firebase Auth user object
   * @returns {void}
   * @since 2.0.0
   */
  private setupPrivateProfileSubscription(user: User): void {
    const privateProfileSub = docSnapshots(
      doc(this.firestore, 'user_data', user.uid)
    ).subscribe((docSnapshot) => {
      console.log('New Private profile snapshot:', docSnapshot);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        this._currentUserPrivateProfile = UserPrivateProfile.fromDB(data);
        console.log(
          'Current user private profile:',
          this._currentUserPrivateProfile
        );
        this.$currentUserPrivateProfile.next(this._currentUserPrivateProfile);
      } else {
        // Create new private profile
        this._currentUserPrivateProfile = new UserPrivateProfile();
        this._currentUserPrivateProfile.email = user.email || '';
        this.$currentUserPrivateProfile.next(this._currentUserPrivateProfile);
        setDoc(
          doc(this.firestore, 'user_data', user.uid),
          this._currentUserPrivateProfile.toDB()
        );
      }
    });

    this.subscriptions.push(privateProfileSub);
  }

  /**
   * Set up public profile subscription
   *
   * Creates real-time subscription for user's public profile data.
   * Automatically creates profile if it doesn't exist.
   *
   * @private
   * @param user - The Firebase Auth user object
   * @returns {void}
   * @since 2.0.0
   */
  private setupPublicProfileSubscription(user: User): void {
    const publicProfileSub = docSnapshots(
      doc(this.firestore, 'user_profile', user.uid)
    ).subscribe((docSnapshot) => {
      console.log('New Public profile snapshot:', docSnapshot);

      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        this._currentUserProfile = UserPublicProfile.fromDB(
          docSnapshot.id,
          data
        );
        console.log('Current user profile:', this._currentUserProfile);
        this.$currentUserProfile.next(this._currentUserProfile);
      } else {
        // Create new public profile
        this._currentUserProfile = new UserPublicProfile();
        this.$currentUserProfile.next(this._currentUserProfile);
        setDoc(
          doc(this.firestore, 'user_profile', user.uid),
          this._currentUserProfile.toDB()
        );
      }
    });

    this.subscriptions.push(publicProfileSub);
  }

  // ========================================
  // USER REGISTRATION & ACCOUNT CREATION
  // ========================================

  /**
   * Register a new user with email and password
   *
   * Creates a new user account with Firebase Auth and sets up initial
   * profile data in Firestore. Handles display name setup if provided.
   *
   * @public
   * @param email - User's email address
   * @param password - User's chosen password
   * @param displayName - Optional display name for the user
   * @returns {Promise<void>} Promise that resolves when registration is complete
   * @throws Will reject if account creation fails
   * @since 1.0.0
   */
  async registerUserWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<void> {
    try {
      // Create new user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Update the user's display name
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      // Merge profile data in Firestore
      await this.mergeProfileData(userCredential, email, displayName);

      console.log('User successfully created:', userCredential.user.uid);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Merge profile data into Firestore
   *
   * Creates initial profile documents for a new user in both
   * user_data (private) and user_profile (public) collections.
   *
   * @private
   * @param user_credentials - The user credential from Firebase Auth
   * @param email - User's email address
   * @param displayName - Optional display name
   * @returns {Promise<void>} Promise that resolves when profile data is saved
   * @since 1.0.0
   */
  private mergeProfileData(
    user_credentials: UserCredential,
    email: string,
    displayName?: string
  ): Promise<void> {
    const batch = writeBatch(this.firestore);

    // Create private profile document
    batch.set(
      doc(this.firestore, 'user_data', user_credentials.user.uid),
      {
        email: email,
        role: 'user',
      },
      { merge: true }
    );

    // Create public profile document
    batch.set(
      doc(this.firestore, 'user_profile', user_credentials.user.uid),
      {
        name: displayName || '',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    return batch.commit();
  }

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  /**
   * Login user with email and password
   *
   * Authenticates user using Firebase Auth with email and password credentials.
   *
   * @public
   * @param email - User's email address
   * @param password - User's password
   * @returns {Promise<UserCredential>} Promise that resolves with user credentials
   * @throws Will reject if authentication fails
   * @since 1.0.0
   */
  loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Sign in user anonymously
   *
   * Creates an anonymous user session for guest access to the application.
   *
   * @public
   * @returns {Promise<UserCredential>} Promise that resolves with anonymous user credentials
   * @throws Will reject if anonymous sign-in fails
   * @since 1.0.0
   */
  signInAnonymously(): Promise<UserCredential> {
    return signInAnonymously(this.auth);
  }

  /**
   * Login user anonymously (alias method)
   *
   * Alias for signInAnonymously method for compatibility with older code.
   *
   * @public
   * @returns {Promise<UserCredential>} Promise that resolves with anonymous user credentials
   * @since 1.0.0
   */
  loginAnonymously(): Promise<UserCredential> {
    return this.signInAnonymously();
  }

  /**
   * Log out current user
   *
   * Signs out the current user and cleans up all subscriptions and cached data.
   *
   * @public
   * @returns {Promise<void>} Promise that resolves when logout is complete
   * @since 1.0.0
   */
  logout(): Promise<void> {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
    this.$currentUser.next(null);
    this.currentUser = undefined;
    this._currentUserPrivateProfile = undefined;
    this.$currentUserPrivateProfile.next(undefined);
    this._currentUserProfile = undefined;
    this.$currentUserProfile.next(undefined);
    return this.auth.signOut();
  }

  // ========================================
  // ACCOUNT MANAGEMENT
  // ========================================

  /**
   * Delete current user account
   *
   * Permanently deletes the current user's account and all associated data
   * from both Firestore and Firebase Auth.
   *
   * @public
   * @returns {Promise<void>} Promise that resolves when account is deleted
   * @throws Will reject if no user is logged in or deletion fails
   * @since 1.0.0
   */
  deleteCurrentUser(): Promise<void> {
    if (this.currentUser) {
      // Delete user data from Firestore
      const batch = writeBatch(this.firestore);
      batch.delete(doc(this.firestore, 'user_data', this.currentUser.uid));
      batch.delete(doc(this.firestore, 'user_profile', this.currentUser.uid));

      // Delete Firebase Auth user
      return deleteUser(this.currentUser);
    }
    return Promise.reject(new Error('No user logged in'));
  }

  /**
   * Change user password
   *
   * Updates the current user's password in Firebase Auth.
   *
   * @public
   * @param newPassword - The new password to set
   * @returns {Promise<void>} Promise that resolves when password is changed
   * @throws Will reject if no user is logged in or password change fails
   * @since 1.0.0
   */
  changePassword(newPassword: string): Promise<void> {
    if (this.auth.currentUser) {
      return updatePassword(this.auth.currentUser, newPassword);
    }
    return Promise.reject(new Error('No user logged in'));
  }

  /**
   * Update user onboarding status
   *
   * Updates the user's onboarding completion status in Firestore.
   * Used to track whether a user has completed the initial app setup.
   *
   * @public
   * @param userId - The ID of the user to update
   * @param onboardingCompleted - Whether onboarding has been completed
   * @returns {Promise<void>} Promise that resolves when status is updated
   * @throws Will reject if update operation fails
   * @since 1.0.0
   */
  async updateUserOnboardingStatus(
    userId: string,
    onboardingCompleted: boolean
  ): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'user_data', userId);
      await setDoc(
        userDocRef,
        {
          needsOnboarding: !onboardingCompleted,
          onboardingCompletedAt: onboardingCompleted ? serverTimestamp() : null,
        },
        { merge: true }
      );

      console.log('User onboarding status updated successfully');
    } catch (error) {
      console.error('Error updating user onboarding status:', error);
      throw error;
    }
  }

  // ========================================
  // USER RANKING & STATISTICS
  // ========================================

  /**
   * Get all users for ranking purposes
   *
   * Fetches all user public profiles and returns them sorted by
   * tracked time in descending order for ranking displays.
   *
   * @public
   * @returns {Observable<UserPublicProfile[]>} Stream of users sorted by tracked time
   * @since 1.0.0
   */
  getAllUsersForRanking(): Observable<UserPublicProfile[]> {
    return collectionSnapshots(collection(this.firestore, 'user_profile')).pipe(
      map((docs) => {
        return docs
          .map((doc) => {
            const data = doc.data();
            const profile = UserPublicProfile.fromDB(doc.id, data);
            return profile;
          })
          .sort((a, b) => b.trackedTime - a.trackedTime); // Sort by tracked time descending
      })
    );
  }
}

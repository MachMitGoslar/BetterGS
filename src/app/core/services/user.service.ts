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
} from '@angular/fire/auth';
import { ReplaySubject, Subscription, Observable, map } from 'rxjs';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public $currentUser = new ReplaySubject<User | null>(1);
  public currentUser: User | undefined;
  public currentUserId: string | undefined;
  public subscriptions: Subscription[] = [];
  public creatingUser: boolean = false;
  public firestore: Firestore = inject(Firestore);
  public auth: Auth = inject(Auth);

  constructor() {
    this.auth.onAuthStateChanged((fb_user) => {
      console.log('Auth state changed:', fb_user);
      if (fb_user) {
        // Only fetch user data if the user ID has actually changed
        // or if we don't have a current user yet
        if (fb_user.uid !== this.currentUserId && this.creatingUser === false) {
          this.creatingUser = true;
          let user = new User(fb_user, this.firestore);
          setTimeout(() => {
            this.creatingUser = false;
          }, 1000); // Reset creatingUser after 1 second
          this.$currentUser.next(user);
          this.currentUser = user;
        } else {
          //Do nothing if the user ID has not changed
          console.log('User ID has not changed, skipping fetch');
        }
      } else {
        console.log('User logged out, clearing data');
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions = [];
        this.$currentUser.next(null);
        this.currentUser = undefined;
        this.currentUserId = undefined;
      }
    });
  }

  registerUserWithEmail(
    email: string,
    password: string
  ): Promise<UserCredential> {
    let credential = EmailAuthProvider.credential(email, password);
    if (!this.currentUser) {
      return Promise.reject(new Error('No user logged in'));
    }
    setDoc(
      doc(
        this.firestore,
        'users',
        this.currentUser.id,
        'data',
        'private_profile'
      ),
      {
        email: email,
      },
      { merge: true }
    );
    setDoc(
      doc(
        this.firestore,
        'users',
        this.currentUser.id,
        'data',
        'public_profile'
      ),
      {
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return linkWithCredential(this.currentUser.firestoreUser!, credential);
  }

  loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signInAnonymously(): Promise<UserCredential> {
    return signInAnonymously(this.auth);
  }

  logout(): Promise<void> {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
    this.$currentUser.next(null);
    this.currentUser = undefined;
    this.currentUserId = undefined;
    return this.auth.signOut();
  }

  deleteCurrentUser(): Promise<void> {
    if (this.currentUser && this.currentUser.firestoreUser) {
      // Delete user data from Firestore
      deleteDoc(doc(this.firestore, 'users', this.currentUser.id));

      // Delete Firebase Auth user
      return deleteUser(this.currentUser.firestoreUser);
    }
    return Promise.reject(new Error('No user logged in'));
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  changePassword(newPassword: string): Promise<void> {
    if (this.auth.currentUser) {
      return updatePassword(this.auth.currentUser, newPassword);
    }
    return Promise.reject(new Error('No user logged in'));
  }

  async createAccountWithEmail(
    email: string,
    password: string
  ): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Alias for updateUser for compatibility
   */
  updateUserProfile() {
    if (this.currentUser) {
      updateProfile(this.currentUser.firestoreUser!, {
        displayName: this.currentUser.publicProfile?.name,
        photoURL: this.currentUser.publicProfile?.profilePictureUrl,
      });

      return this.currentUser.toDB();
    } else {
      return Promise.reject(new Error('No user logged in'));
    }
  }

  /**
   * Alias for sendPasswordResetEmail for compatibility
   */
  resetPassword(email: string): Promise<void> {
    return this.sendPasswordResetEmail(email);
  }

  /**
   * Alias for createAccountWithEmail for compatibility
   */
  async createUserWithEmail(
    email: string,
    password: string
  ): Promise<UserCredential> {
    return this.createAccountWithEmail(email, password);
  }

  /**
   * Fetches all users for ranking purposes
   * Returns users sorted by activity duration (descending)
   */
  getAllUsersForRanking(): Observable<User[]> {
    return collectionSnapshots(collection(this.firestore, 'users')).pipe(
      map((docs) => {
        const users = docs.map((doc) => {
          const data = doc.data();
          // Create a mock FirestoreUser for the User.fromDB method
          const mockFirestoreUser = {
            uid: doc.id,
            email: data['email'] || null,
            displayName: data['name'] || 'Anonymous User',
          } as FirestoreUser;

          return new User(mockFirestoreUser, this.firestore);
        });

        // Sort users by activity_duration in descending order
        return users.sort((a, b) => {
          if (!a.publicProfile.trackedTime || !b.publicProfile.trackedTime)
            return 0;
          return b.publicProfile.trackedTime - a.publicProfile.trackedTime;
        });
      })
    );
  }

  /**
   * Method for anonymous login - alias for signInAnonymously for compatibility
   */
  loginAnonymously(): Promise<UserCredential> {
    return this.signInAnonymously();
  }
}

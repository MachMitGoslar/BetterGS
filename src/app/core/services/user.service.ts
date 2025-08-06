import { inject, Injectable } from '@angular/core';
import { deleteDoc, doc, docSnapshots, Firestore, getDoc, serverTimestamp, setDoc, collection, collectionSnapshots } from '@angular/fire/firestore';
import { Auth, signInAnonymously, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, User as FirestoreUser, UserCredential, updatePassword, updateProfile, deleteUser } from '@angular/fire/auth'; 
import { ReplaySubject, Subscription, Observable, map } from 'rxjs';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public $currentUser = new ReplaySubject<User | null>(1);
  public currentUser: User | undefined;
  public currentUserId: string | undefined;
  public subscriptions: Subscription[] = [];  

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {
    this.auth.onAuthStateChanged((user) => {
      if(user) {
        // Only fetch user data if the user ID has actually changed
        // or if we don't have a current user yet
        if(this.currentUserId !== user.uid || !this.currentUser) {
          console.log("User ID changed or no current user - fetching data");
          console.log("User: ",user);
          console.log("Current User ID: ", this.currentUserId);
          console.log("New User ID: ", user.uid);
          
          this.currentUserId = user.uid;
          this.fetchUserData(user);
        } else {
          console.log("Same user, skipping fetchUserData");
        }
        
      } else {
        console.log("User logged out, clearing data");
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
        this.$currentUser.next(null);
        this.currentUser = undefined;
        this.currentUserId = undefined;
      }
    });

  }

  fetchUserData(user: FirestoreUser){
    // Clean up any existing subscription for this user
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    const subscription = docSnapshots(doc(this.firestore, 'users', user.uid)).subscribe(docSnapshot => {
      console.log("User data snapshot:", docSnapshot);
      
      if (docSnapshot.exists()) {
        console.log("User data exists:", docSnapshot.data());
        let userData = docSnapshot.data();
        let local_user = User.fromDB(user, userData);
        this.$currentUser.next(local_user);
        this.currentUser = local_user;
      } else {
        // If user data does not exist, create a new user document
        console.log("User data does not exist, creating new user document");
        const user_data = new User(user.uid).toDB(true)
        setDoc(doc(this.firestore, 'users', user.uid), user_data);
      }
    });
    this.subscriptions.push(subscription);
  }

  registerUserWithEmail(email: string, password: string): Promise<UserCredential> {
    let credential = EmailAuthProvider.credential(email, password);
    if (!this.currentUser) {
      return Promise.reject(new Error("No user logged in"));
    }
    setDoc(doc(this.firestore, 'users', this.currentUser.id), {
      email: email,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return linkWithCredential(this.currentUser.firestoreUser!, credential);
  }

  loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signInAnonymously(): Promise<UserCredential> {
    return signInAnonymously(this.auth);
  }

  logout(): Promise<void> {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
    return Promise.reject(new Error("No user logged in"));
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  changePassword(newPassword: string): Promise<void> {
    if (this.auth.currentUser) {
      return updatePassword(this.auth.currentUser, newPassword);
    }
    return Promise.reject(new Error("No user logged in"));
  }

  async createAccountWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
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
        displayName: this.currentUser.name,
        photoURL: this.currentUser.pictureUrl
      });
      
      return setDoc(doc(this.firestore, 'users', this.currentUser.id), this.currentUser.toDB(), { merge: true })
        .then(() => {
          console.log("Profile update completed successfully");
          // Reset flag after a delay to allow Firestore to sync
          setTimeout(() => {

          }, 1000);
        })

    } else {
      return Promise.reject(new Error("No user logged in"));
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
  async createUserWithEmail(email: string, password: string): Promise<UserCredential> {
    return this.createAccountWithEmail(email, password);
  }

  /**
   * Fetches all users for ranking purposes
   * Returns users sorted by activity duration (descending)
   */
  getAllUsersForRanking(): Observable<User[]> {
    return collectionSnapshots(collection(this.firestore, 'users')).pipe(
      map(docs => {
        const users = docs.map(doc => {
          const data = doc.data();
          // Create a mock FirestoreUser for the User.fromDB method
          const mockFirestoreUser = {
            uid: doc.id,
            email: data['email'] || null,
            displayName: data['name'] || 'Anonymous User'
          } as FirestoreUser;
          
          return User.fromDB(mockFirestoreUser, data);
        });
        
        // Sort users by activity_duration in descending order
        return users.sort((a, b) => b.activity_duration - a.activity_duration);
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

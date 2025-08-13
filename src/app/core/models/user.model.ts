import { User as FirestoreUser } from '@angular/fire/auth';
import { generateRandomProfileName, UserPublicProfile } from './user_public_profile.model';
import { UserPrivateProfile } from './user_private_profile.model';
import { docSnapshots, Firestore, collection, DocumentReference, doc, getDoc, setDoc, serverTimestamp,writeBatch, getCountFromServer } from '@angular/fire/firestore';
import { create } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';


export class User {

    public id: string;
    public firestoreUser: FirestoreUser | undefined;
    public publicProfile: UserPublicProfile;
    public privateProfile: UserPrivateProfile;
    public ref: DocumentReference;
    public firestore: Firestore;
    public role: 'user' | 'admin' = 'user'; // User role for admin functionality

    public subscription: Subscription[] = [];

    constructor(fb_user: FirestoreUser, firestore: Firestore) {
        console.log(firestore)
        this.firestore = firestore;
        console.log("Creating new User instance with ID:", fb_user.uid);
        this.id = fb_user.uid;
        this.publicProfile = new UserPublicProfile();
        this.privateProfile = new UserPrivateProfile();
        this.firestoreUser = fb_user;

 
        
        this.ref = doc(this.firestore, 'users', fb_user.uid);
        getDoc(this.ref).then(docSnapshot => {
            if (!docSnapshot.exists()) {
                // If the user document does not exist, create it
                console.log("Creating user document for:", fb_user.uid);
                setDoc(this.ref, {
                    id: fb_user.uid,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }
        }).catch(error => {
            console.error("Error fetching user document:", error);
        });

        //Get public profile
        let subs_pub = docSnapshots(doc(this.firestore, 'users', fb_user.uid, "data", "public_profile")).subscribe(docSnapshot => {
            if (docSnapshot.exists()) {
                let data = docSnapshot.data();
                this.publicProfile = UserPublicProfile.fromDB(data);
                        //Get ActivitiesCount 
        getCountFromServer(collection(this.firestore, 'users', fb_user.uid, "activities")).then(countSnapshot => {
            this.publicProfile.trackedActivities = countSnapshot.data().count || 0;
            console.log("Tracked activities count for user:", fb_user.uid, "is", this.publicProfile.trackedActivities);
            // Update the public profile in Firestore
        });
            } else {
                this.publicProfile = new UserPublicProfile();
                this.publicProfile.createdAt = new Date();
                this.publicProfile.updatedAt = new Date();
                this.publicProfile.trackedTime = 0; // Initialize tracked time
                try {
                    console.log("Creating public profile for user:", fb_user.uid);
                   setDoc(doc(this.firestore, 'users', fb_user.uid, "data", "public_profile"), this.publicProfile.toDB(), { merge: true });
                } catch (error) {
                   console.error("Error creating public profile:", error);
                }
            }
        });
        this.subscription.push(subs_pub);

        //Get private profile
        let subs_priv = docSnapshots(doc(this.firestore, 'users', fb_user.uid, "data", "private_profile")).subscribe(docSnapshot => {
            if (docSnapshot.exists()) {
                let data = docSnapshot.data();
                this.privateProfile = UserPrivateProfile.fromDB(data);
            } else {
                this.privateProfile = new UserPrivateProfile();
                this.privateProfile.email = fb_user.email || '';
                this.privateProfile.role = 'user'; // Default role
                try {
                    console.log("Creating private profile for user:", fb_user.uid);
                   setDoc(doc(this.firestore, 'users', fb_user.uid, "data", "private_profile"), this.privateProfile.toDB(), { merge: true });
                } catch (error) {
                   console.error("Error creating private profile:", error);
                }
            }
        });



        this.subscription.push(subs_priv);

        this.ref = doc(this.firestore, 'users', fb_user.uid);
    }


    toDB(): Promise<void> {
        let batch = writeBatch(this.firestore);

        if(this.publicProfile) {
            batch.set(doc(this.firestore, 'users', this.id, "data", "public_profile"), this.publicProfile.toDB(), { merge: true });
        }

        if(this.privateProfile) {
            batch.set(doc(this.firestore, 'users', this.id, "data", "private_profile"), this.privateProfile.toDB(), { merge: true });
        }
        return batch.commit();
    }

    get path(): string {
        return "users/" + this.id;
    }

    get days_active(): number {
        if (!this.publicProfile?.createdAt) return 0;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.publicProfile.createdAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    }


    destroy() {
      // Unsubscribe from all subscriptions
      if (this.subscription.length > 0) {
        this.subscription.forEach(sub => sub.unsubscribe());
        this.subscription = [];
      }
    }
}
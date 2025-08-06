import { inject, Injectable } from '@angular/core';
import { collection, collectionCount, collectionData, collectionGroup, deleteDoc, doc, Firestore} from '@angular/fire/firestore';
import { Auth, deleteUser, signOut} from '@angular/fire/auth'; 
import { getStorage, ref, uploadString, getDownloadURL, Storage, deleteObject, listAll } from '@angular/fire/storage';
import { map, Observable, ReplaySubject } from 'rxjs';
import { Activity } from '../models/activity.model';
import { Tracking } from '../models/tracking.model';
import { UserService } from './user.service';
import { ActivityService } from './activity.service';
import { TrackingService } from './tracking.service';
import { NotificationService } from './notification.service';
import { I18nService } from './i18n.service';
import { User } from '../models/user.model';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})


export class ApplicationService {

  $currentUser: Observable<User | null>;
  private _currentUser: User | undefined;
  $activities: Observable<Activity[]>;
  $user_activities = new ReplaySubject<Activity[]>(1);

  $activeTracking = new ReplaySubject<Tracking | void>(1);
  _activeTracking: Tracking | void = undefined;

  notificationsAllowed: boolean = false;
  // firestore = inject(Firestore);
  // auth = inject(Auth);




  constructor(
    public usrSrv: UserService,
    public activityService: ActivityService,
    public trackingService: TrackingService,
    public userService: UserService,
    public notificationService: NotificationService,
    public i18nService: I18nService,
    public firestore: Firestore,
    public auth: Auth,
    public storage: Storage
  ) {
    this.$currentUser = this.usrSrv.$currentUser;
    this.$activities = this.activityService.$activities;

    this.$user_activities.next([]);

    this.$currentUser.subscribe(user => {
      if(user && user !== null && user != this._currentUser) {
        this._currentUser = user ? user : undefined;

                  this.setupAppData();


      }
    })

  }


  public setupAppData(): Promise<void> {
        if (this._currentUser) {
          console.log('Current user:', this._currentUser);
          this.activityService.getActivitiesByUser(doc(this.firestore, "users", this._currentUser.id)).subscribe(activities => {
            this.$user_activities.next(activities);
          });

        }

        LocalNotifications.checkPermissions().then((result) => {  
          if (result.display === 'granted') {
            this.notificationsAllowed = true;
          } else if( result.display === 'denied') {
            this.notificationsAllowed = false;
          }
        })


        return Promise.resolve();

  
  }

  startTracking(activity: Activity) {

    if(!this.usrSrv.currentUser) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'), 
        "warning"
      );
      console.log(this.usrSrv);
      return;
    }
    if (!activity) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.activity.not.available'), 
        "danger"
      );
      return;
    }
    if (this._activeTracking) {
      this._activeTracking = this.trackingService.stopTracking(this._activeTracking);
      return;
    }
    this._activeTracking = this.trackingService.startTracking(activity, this.usrSrv.currentUser);
    this.$activeTracking.next(this._activeTracking);
  }

  stopTracking(): void {
    if(!this.usrSrv.currentUser) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'), 
        "warning"
      );
      return;
    }
    if (!this._activeTracking) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.tracking.not.available'), 
        "danger"
      );
      return;   

    }

    this._activeTracking = this.trackingService.stopTracking(this._activeTracking);
    this.$activeTracking.next(this._activeTracking);
    this.notificationService.addNotification(
      this.i18nService.getTranslation('success.tracking.stopped'), 
      "success"
    );
  }

  getRecentTrackngsByActivity(activity: Activity): Observable<Tracking[]> {
    if (!this.usrSrv.currentUser) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'), 
        "warning"
      );
      return new ReplaySubject<Tracking[]>(1);
    }
    if (!activity || !activity.ref) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.activity.not.available'), 
        "danger"
      );
      return new ReplaySubject<Tracking[]>(1);
    }

    return this.trackingService.getTrackingsByActivity(this.usrSrv.currentUser.id, activity.ref);
  }

  registerUserWithEmail(email: string, password: string): void {
    if(this._currentUser && this._currentUser.firestoreUser?.isAnonymous) {
      this.usrSrv.registerUserWithEmail(email, password).then((userCredential) => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('success.user.registered'), 
          "success"
        );
      }).catch((error) => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('error.user.registration') + ": " + error.message, 
          "danger"
        );
      });
    }
  }

  changePassword(newPassword: string): void {
    if(this._currentUser && this._currentUser.firestoreUser) {
      this.usrSrv.changePassword(newPassword).then(() => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('success.password.changed'), 
          "success"
        );
      }).catch((error) => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('error.password.change') + ": " + error.message, 
          "danger"
        );
      });
    } else {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.logged.in'), 
        "warning"
      );
    }
  }

  updateUserProfile(displayName: string, pictureUrl?: string): Promise<void> {
    console.log('Updating user profile with:', { displayName, pictureUrl });
    if(this._currentUser) {
      this._currentUser.name = displayName;
      if (pictureUrl !== undefined) {
        this._currentUser.pictureUrl = pictureUrl;
      }
      return this.usrSrv.updateUserProfile().then(() => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('success.profile.updated'), 
          "success"
        );
      }).catch((error) => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('error.profile.update') + ": " + error.message, 
          "danger"
        );
        throw error; // Re-throw to allow caller to handle
      });
    } else {
      const errorMsg = this.i18nService.getTranslation('error.no.user.logged.in');
      this.notificationService.addNotification(errorMsg, "warning");
      return Promise.reject(new Error(errorMsg));
    }
  }

  /**
   * Uploads user profile image to Firebase Storage
   */
  async uploadUserProfileImage(base64String: string, fileName: string, metadata?: any): Promise<string> {
    if (!this._currentUser) {
      throw new Error(this.i18nService.getTranslation('error.no.user.logged.in'));
    }

    try {
      const storage = getStorage();
      const imageRef = ref(storage, `users/${this._currentUser.id}/profile/${Date.now()}_${fileName}`);
      
      // Upload the base64 string
      const uploadResult = await uploadString(imageRef, base64String, 'data_url', metadata);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error(this.i18nService.getTranslation('profile.error.uploadFailed'));
    }
  }

  get active_activities(): Observable<number> {
    if (this._currentUser) {
      return collectionCount(collection(this.firestore, this._currentUser!.path, 'activities')).pipe(
        map(count => count || 0)
      );
    } else {
      return new ReplaySubject<number>(1);
    }

  }

  logout() {
    if (this._currentUser) {
      console.log("Logging out user:", this._currentUser.id);
        signOut(this.auth).then(() => {
          this.notificationService.addNotification(
            this.i18nService.getTranslation('success.logged.out'), 
            "success"
          );
        }).catch((error) => {
          this.notificationService.addNotification(
            this.i18nService.getTranslation('error.logout') + ": " + error.message, 
            "danger"
          );
        });
      

      this._currentUser = undefined;
      this.$currentUser = new ReplaySubject<User>(1);
      this.$user_activities.next([]);
      this.$activeTracking.next(undefined);
      this.$activities = new ReplaySubject<Activity[]>(1);
      this.usrSrv = new UserService(this.firestore, this.auth);

    } else {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.no.user.to.logout'), 
        "warning"
      );
    }
    
  }

  loginWithEmail(email: string, password: string): Promise<void> {
    return this.usrSrv.loginWithEmail(email, password).then((userCredential) => {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('success.login'), 
        "success"
      );
    }).catch((error) => {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.login') + ": " + error.message, 
        "danger"
      );
      throw error;
    });
  }

  loginAnonymously(): Promise<void> {
    return this.usrSrv.loginAnonymously().then((userCredential) => {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('success.anonymous.login'), 
        "success"
      );
    }).catch((error) => {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.anonymous.login') + ": " + error.message, 
        "danger"
      );
      throw error;
    });
  }

  resetPassword(email: string): Promise<void> {
    return this.usrSrv.resetPassword(email).then(() => {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('success.password.reset.sent'), 
        "success"
      );
    }).catch((error) => {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.password.reset') + ": " + error.message, 
        "danger"
      );
      throw error;
    });
  }

  createUserWithEmail(email: string, password: string): Promise<void> {
    return this.usrSrv.createUserWithEmail(email, password).then((userCredential) => {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('success.account.created'), 
        "success"
      );
    }).catch((error) => {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.account.creation') + ": " + error.message, 
        "danger"
      );
      throw error;
    });
  }

  /**
   * Creates user account and immediately sets the display name
   * This method handles the signup flow properly to avoid race conditions
   */
  async createUserWithEmailAndDisplayName(email: string, password: string, displayName: string): Promise<void> {
    try {
      // First create the account
      await this.usrSrv.createUserWithEmail(email, password);
      
      // Wait a bit for the user to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then update the profile with the display name
      if (this._currentUser) {
        await this.updateUserProfile(displayName);
      }
      
      this.notificationService.addNotification(
        this.i18nService.getTranslation('success.account.created'), 
        "success"
      );
    } catch (error: any) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('error.account.creation') + ": " + error.message, 
        "danger"
      );
      throw error;
    }
  }

  requestNotificationPermissions(): Promise<void> {
      LocalNotifications.requestPermissions().then((result) => {
          if (result.display === 'granted') {
            this.notificationsAllowed = true;
          } else if( result.display === 'denied') {
            this.notificationsAllowed = false;
          }
        });
    return Promise.resolve();
  }
}

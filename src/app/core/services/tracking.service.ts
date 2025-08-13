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
import { User } from '../models/user.model';
import { LocalNotificationSchema } from '@capacitor/local-notifications';

export interface ActivtiyTrackings {
  activityId: string;
  activityName: string;
  activcityRef: DocumentReference;
  activityIcon: string;
  trackings: Tracking[];
}

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  public $trackings = new ReplaySubject<Tracking[]>(1);
  private _trackings: Tracking[] = [];
  public activeTracking: Tracking | undefined;

  /**
   * Injected services
   */
  private notificationService = inject(NotificationService);
  private i18nService = inject(I18nService);
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  constructor() {
    // Initialize tracking data or fetch from a service if needed
    this._trackings = [];
    this.$trackings.next(this._trackings);
  }

  getTrackingsByActivity(
    user: string,
    activityRef: DocumentReference
  ): Observable<Tracking[]> {
    return collectionSnapshots(
      collection(
        this.firestore,
        'users',
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

  startTracking(activity: Activity, user: User) {
    let notifications: LocalNotificationSchema[] = [
      {
        id: 0,
        title: this.i18nService.getTranslation(
          'tracking.localNotifications.startTracking'
        ),
        body: 'Dein Tracking für ' + activity.title + ' läuft noch.',
        schedule: { at: new Date(Date.now() + (60 * 1000)) }, // Schedule for 1 minute later
      },
    ];
    this.notificationService.scheduleLocalNotifications(notifications);
    return Tracking.startTracking(
      activity.ref!,
      doc(this.firestore, 'users', user.id)
    );
  }

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

  saveToDB(tracking: Tracking) {
    if (tracking.userRef === undefined || tracking.userRef === null) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('tracking.error.userRefRequired'),
        'danger'
      );
      throw new Error(
        this.i18nService.getTranslation('tracking.error.userRefRequired')
      );
    }
    if (tracking.activityRef === undefined || tracking.activityRef === null) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('tracking.error.activityRefRequired'),
        'danger'
      );
      throw new Error(
        this.i18nService.getTranslation('tracking.error.activityRefRequired')
      );
    }

    let batch = writeBatch(this.firestore);

    batch.set(
      doc(
        this.firestore,
        'users',
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
        imageUrl: tracking.imageUrl || null, // Default image URL
        activityRef: tracking.activityRef ? tracking.activityRef : null,
        userRef: tracking.userRef ? tracking.userRef : null,
      }
    );

    batch.set(
      doc(
        this.firestore,
        'users',
        tracking.userRef.id,
        'activities',
        tracking.activityRef.id
      ),
      {
        duration: increment(tracking.duration),
      },
      { merge: true }
    );

    batch.set(
      doc(
        this.firestore,
        'users',
        tracking.userRef.id,
        'data',
        'public_profile'
      ),
      {
        trackedTime: increment(tracking.duration),
        total_trackings: increment(1),
      },
      { merge: true }
    );

    batch
      .commit()
      .then(() => {
        //TODO: Handlle notification or success message
        this.notificationService.addNotification(
          this.i18nService.getTranslation('tracking.success.dataSaved')
        );
      })
      .catch((error) => {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('tracking.error.saveFailed') + error,
          'danger'
        );
        console.error('Error saving tracking data: ', error);
      });
  }

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
        `users/${tracking.userRef.id}/activities/${tracking.activityRef.id}/trackings/${tracking.id}`
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

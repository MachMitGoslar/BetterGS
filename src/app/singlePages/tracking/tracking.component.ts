import { Component, OnInit, Input, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tracking } from 'src/app/core/models/tracking.model';
import { Activity } from 'src/app/core/models/activity.model';
import { ActivityService } from 'src/app/core/services/activity.service';
import { Timestamp } from '@angular/fire/firestore';
import {
  IonContent,
  IonIcon,
  ModalController,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonBackButton,
  IonCardSubtitle,
  IonButtons,
  IonList,
  IonItemDivider,
  IonGrid,
  IonCol,
  IonRow,
} from '@ionic/angular/standalone';
import { ApplicationService } from 'src/app/core/services/application.service';
import { ActivatedRoute } from '@angular/router';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';
import { Observable } from 'rxjs';
import { TrackingCardComponent } from 'src/app/components/tracking-card/tracking-card.component';
import { TrackingEditModalComponent } from 'src/app/components/tracking-edit-modal/tracking-edit-modal.component';
import { I18nService } from 'src/app/core/services/i18n.service';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
  standalone: true,
  imports: [
    IonItemDivider,
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonCardSubtitle,
    IonButtons,
    ElapsedTimePipe,
    TrackingCardComponent,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class TrackingComponent implements OnInit, OnDestroy {
  // Properties for tracking state
  isTracking: boolean = false;
  currentActivity: Activity | undefined;
  currentTracking?: Tracking;
  recentTrackings: Observable<Tracking[]> | undefined;

  // Properties for time display
  public elapsedTime: number = 0;
  private intervalId: any;

  // Available activities
  activities: Activity[] = [];

  private applicationService = inject(ApplicationService);
  private activityService = inject(ActivityService);
  public modalCtrl = inject(ModalController);
  public route = inject(ActivatedRoute);
  public i18nService = inject(I18nService);

  constructor() {}

  ngOnInit() {
    // Load available activities
    this.activityService.$activities.subscribe((activities) => {
      this.activities = activities;
    });

    if (!this.route.snapshot.params['activityId']) {
      throw 'No activity ID provided in route parameters';
    }

    this.currentActivity =
      this.activities.find(
        (activity) => activity.id === this.route.snapshot.params['activityId']
      ) || undefined;
    if (!this.currentActivity) {
      console.warn(
        'No activity found for the provided ID:',
        this.route.snapshot.params['activityId']
      );
      return;
    }
    this.recentTrackings = this.applicationService.getRecentTrackngsByActivity(
      this.currentActivity
    );

    // TODO: Initialize current tracking from service if available
    this.applicationService.$activeTracking.subscribe((tracking) => {
      console.log('Active tracking subscription fired', tracking);
      this.currentTracking = tracking;
      if (this.currentTracking) {
        this.isTracking = true;
        this.startTimer();
        // Find the current activity
        this.currentActivity = this.activities.find(
          (activity) =>
            activity.ref?.id === this.currentTracking?.activityRef?.id
        );
      }
    });
    this.applicationService.onAppGoesBackground(() => {
      this.stopTimer();
    });

    this.applicationService.onAppComesForeground(() => {
      if (this.currentTracking && this.currentTracking.startDate) {
        this.startTimer();
        //this.updateElapsedTime();
      }
    });

    //   this.isTracking = true;
    //   this.startTimer();
    //   // Find the current activity
    //   this.currentActivity = this.activities.find(
    //     activity => activity.ref?.id === this.currentTracking?.activityRef?.id
    //   );
    // }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * Starts tracking for the selected activity
   */
  startTracking() {
    // Create new tracking instance using the static method
    this.applicationService.startTracking(this.currentActivity!);

    this.isTracking = true;
    this.startTimer();
  }

  /**
   * Stops the current tracking session
   */
  async stopTracking() {
    if (!this.currentTracking) return;

    let finishedTracking = this.currentTracking;
    this.applicationService.stopTracking();
    this.isTracking = false;
    this.stopTimer();

    // Here you could save the tracking to the database
    // this.trackingService.saveTracking(this.currentTracking);

    // Reset state
    this.elapsedTime = 0;

    console.log('Tracking stopped:', finishedTracking);
    let modal = await this.modalCtrl.create({
      component: TrackingEditModalComponent,
      componentProps: {
        tracking: finishedTracking,
      },
    });
    await modal.present();
  }

  /**
   * Handles activity selection from dropdown
   */
  // onActivitySelected(event: any) {
  //   this.selectedActivityId = event.detail.value;
  //   this.currentActivity = this.activities.find(activity => activity.id === this.selectedActivityId);
  // }

  /**
   * Starts the timer interval
   */
  private startTimer() {
    this.intervalId = setInterval(() => {
      if (this.currentTracking && this.currentTracking.startDate) {
        const now = new Date().getTime();
        const start = this.currentTracking.startDate.getTime();
        this.elapsedTime = now - start;
      }
    }, 10);
  }

  /**
   * Stops the timer interval
   */
  private stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Formats the start time of current tracking
   */
  formatStartTime(): string {
    if (!this.currentTracking || !this.currentTracking.startDate) return '';

    return this.currentTracking.startDate.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formats a timestamp to readable date/time
   */
  formatDate(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get tracking_for_different(): boolean {
    const different =
      this.currentTracking?.activityRef?.id !==
      this.route.snapshot.params['activityId'];
    return this.currentTracking !== undefined && different;
  }

  getDifferentActivityName(activityId: string): string | undefined {
    const activity = this.activities.find((a) => a.id === activityId);
    return activity ? activity.title : undefined;
  }
}

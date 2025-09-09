import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  inject,
} from '@angular/core';
import {
  IonButton,
  IonItem,
  IonIcon,
  IonToolbar,
  IonTitle,
  ModalController,
} from '@ionic/angular/standalone';
import { defaultIfEmpty, interval, map, Observable, Subscription } from 'rxjs';
import { Activity } from 'src/app/core/models/activity.model';
import { Tracking } from 'src/app/core/models/tracking.model';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';
import { ApplicationService } from 'src/app/core/services/application.service';
import { TrackingEditModalComponent } from '../tracking-edit-modal/tracking-edit-modal.component';

@Component({
  selector: 'app-active-tracking-bar',
  templateUrl: './active-tracking-bar.component.html',
  styleUrls: ['./active-tracking-bar.component.scss'],
  imports: [IonTitle, ElapsedTimePipe, IonIcon, CommonModule],
})
export class ActiveTrackingBarComponent implements OnInit, OnDestroy {
  $activeTracking: Observable<Tracking | undefined>;
  public _activeTracking?: Tracking;
  public elapsedTime: number = 0;

  public applicationService: ApplicationService = inject(ApplicationService);
  public modalController: ModalController = inject(ModalController);

  private _interval: any | undefined;
  private subscriptions: Subscription[] = [];

  constructor() {
    this.$activeTracking = this.applicationService.$activeTracking;
  }

  ngOnInit() {
    // Subscribe to active tracking changes
    const trackingSubscription = this.$activeTracking.subscribe((tracking) => {
      this._activeTracking = tracking;
      this.handleTrackingChange();
    });
    this.subscriptions.push(trackingSubscription);

    // Subscribe to app lifecycle changes
    this.applicationService.onAppComesForeground(() => {
      if (this._activeTracking && this._activeTracking.startDate) {
        this.startTimer();
        this.updateElapsedTime();
      }
    });
    this.applicationService.onAppGoesBackground(() => {
      this.stopTimer();
    });

    // Start initial timer if tracking is active
    if (this._activeTracking && this._activeTracking.startDate) {
      this.startTimer();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private handleTrackingChange() {
    console.log('Handling tracking change');
    if (
      this._activeTracking &&
      this._activeTracking.startDate &&
      this.applicationService.isAppActive
    ) {
      console.log('Starting timer');
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  private startTimer() {
    this.stopTimer(); // Ensure no duplicate timers

    this._interval = setInterval(() => {
      this.updateElapsedTime();
    }, 100);
  }

  private stopTimer() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
  }

  private updateElapsedTime() {
    if (this._activeTracking && this._activeTracking.startDate) {
      this.elapsedTime =
        new Date().getTime() - this._activeTracking.startDate.getTime();
    }
  }

  async stopTracking(tracking: Tracking | void): Promise<void> {
    console.log('Stopping tracking');
    console.log('Stopping tracking', tracking);
    //if(tracking !== void 0 && tracking !== undefined) {
    this.applicationService.stopTracking();

    let modal = await this.modalController.create({
      component: TrackingEditModalComponent,
      componentProps: {
        tracking: tracking,
      },
    });
    await modal.present();
    //}
  }

  get activity(): Observable<Activity | void> {
    return this.$activeTracking.pipe(
      map((tracking) => {
        if (tracking) {
          return tracking.activityRef
            ? this.applicationService.activityService.getActivityById(
                tracking.activityRef.id
              )
            : undefined;
        }
        return undefined;
      }),
      defaultIfEmpty(undefined)
    );
  }
}

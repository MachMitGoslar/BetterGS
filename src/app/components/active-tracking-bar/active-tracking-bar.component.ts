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

/**
 * ActiveTrackingBarComponent - Active Activity Tracking Display
 *
 * A component that displays the currently active tracking session with
 * real-time elapsed time updates and controls for managing the session.
 *
 * Key Features:
 * - Real-time elapsed time display with automatic updates
 * - Integration with ApplicationService for tracking state
 * - Modal-based tracking session editing
 * - Automatic cleanup of intervals and subscriptions
 * - Responsive design for mobile and desktop
 *
 * Technical Details:
 * - Uses interval-based timer for real-time updates
 * - Subscribes to ApplicationService active tracking observable
 * - Manages component lifecycle with proper cleanup
 * - Integrates with TrackingEditModalComponent for session editing
 *
 * Dependencies:
 * - ApplicationService: Core tracking state management
 * - ModalController: Modal presentation for editing
 * - ElapsedTimePipe: Time formatting for display
 *
 * @author BetterGS Development Team
 * @version 1.0.0
 * @since 2025
 */
@Component({
  selector: 'app-active-tracking-bar',
  templateUrl: './active-tracking-bar.component.html',
  styleUrls: ['./active-tracking-bar.component.scss'],
  standalone: true,
  imports: [IonTitle, ElapsedTimePipe, IonIcon, CommonModule],
})
export class ActiveTrackingBarComponent implements OnInit, OnDestroy {
  /**
   * Observable stream of the currently active tracking session
   * Provides real-time updates when tracking state changes
   */
  $activeTracking: Observable<Tracking | undefined>;

  /**
   * Current active tracking session data
   * Used for local state management and display
   */
  public _activeTracking?: Tracking;

  /**
   * Elapsed time in seconds since tracking started
   * Updated every second by the internal timer
   */
  public elapsedTime: number = 0;

  /**
   * Core application service for tracking operations
   */
  public applicationService: ApplicationService = inject(ApplicationService);

  /**
   * Ionic modal controller for presenting tracking edit modal
   */
  public modalController: ModalController = inject(ModalController);

  /**
   * Internal timer interval for elapsed time updates
   * Cleared on component destruction
   */
  private _interval: NodeJS.Timeout | undefined;

  /**
   * Array of RxJS subscriptions for cleanup
   */
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
    if (
      this._activeTracking &&
      this._activeTracking.startDate &&
      this.applicationService.isAppActive
    ) {
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

import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
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
import { defaultIfEmpty, interval, map, Observable } from 'rxjs';
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
export class ActiveTrackingBarComponent implements OnInit {
  $activeTracking: Observable<Tracking | undefined>;
  public _activeTracking?: Tracking;
  public elapsedTime: number = 0;

  public applicationService: ApplicationService = inject(ApplicationService);
  public modalController: ModalController = inject(ModalController);
  private _interval: any | undefined;

  constructor() {
    this.$activeTracking = this.applicationService.$activeTracking;
  }

  ngOnInit() {
    this.$activeTracking.subscribe((tracking) => {
      this._activeTracking = tracking;
    });

    if (this._activeTracking && this._activeTracking.startDate) {
      this._interval = setInterval(() => {
        if (this._activeTracking && this._activeTracking.startDate) {
          this.elapsedTime =
            new Date().getTime() - this._activeTracking.startDate.getTime();
        } else {
          clearInterval(this._interval!);
        }
      }, 100);
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

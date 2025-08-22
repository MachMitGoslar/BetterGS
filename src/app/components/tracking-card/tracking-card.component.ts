import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent, 
  IonIcon,
  ModalController
} from "@ionic/angular/standalone";
import { Tracking } from 'src/app/core/models/tracking.model';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';
import { ActivityService } from 'src/app/core/services/activity.service';
import { pencil, imageOutline, timeOutline, playCircleOutline, arrowForwardOutline, stopCircleOutline, documentTextOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { TrackingEditModalComponent } from '../tracking-edit-modal/tracking-edit-modal.component';
import { Activity } from 'src/app/core/models/activity.model';

@Component({
  selector: 'app-tracking-card',
  templateUrl: './tracking-card.component.html',
  styleUrls: ['./tracking-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonIcon,
    ElapsedTimePipe,
  ]
})
export class TrackingCardComponent implements OnInit {

  @Input() tracking: Tracking | undefined;
  activity?: Activity;
  public activityService: ActivityService = inject(ActivityService);
  public modalController: ModalController = inject(ModalController);

  constructor( ) { 
    addIcons({imageOutline,pencil,timeOutline,playCircleOutline,arrowForwardOutline,stopCircleOutline,documentTextOutline});
  }

  ngOnInit() {
        this.activity = this.activityService.activities.find(a => a.id === this.tracking!.activityRef!.id);
  }

  getActivityName(): string {
    if (!this.tracking || !this.tracking.activityRef) {
      return 'Unknown Activity';
    }
    return this.activity ? this.activity.title : 'Unknown Activity';
  }

  async editTracking(): Promise<void> {
    if (!this.tracking) {
      console.warn('Tracking is not defined');
      return;
    }
    // Logic to open the tracking edit modal
    // This could be a service call or an event emitter to notify parent component
    const modal = await this.modalController.create({
      component: TrackingEditModalComponent,
      componentProps: {
        tracking: this.tracking
      }
    });
    modal.present();
  }

}

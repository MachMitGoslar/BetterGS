import { Component, inject, Input, OnInit } from '@angular/core';
import { Activity } from 'src/app/core/models/activity.model';
import {
  IonItem,
  IonLabel,
  IonIcon,
  IonButtons,
  IonButton,
  IonRouterLink,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import * as icons from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ApplicationService } from 'src/app/core/services/application.service';
import { Tracking } from 'src/app/core/models/tracking.model';
import { Router, RouterLinkWithHref } from '@angular/router';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss'],
  imports: [
    IonItem,
    IonLabel,
    CommonModule,
    IonIcon,
    RouterLinkWithHref,
    ElapsedTimePipe,
  ],
})
export class ActivityItemComponent implements OnInit {
  @Input() activity?: Activity;
  public currentUser: User | undefined;

  public applicationService: ApplicationService = inject(ApplicationService);
  public trackingSrv: TrackingService = inject(TrackingService);
  public router: Router = inject(Router);
  constructor() {
    // Ensure the icons are loaded
    addIcons(icons);
    this.applicationService.$currentUser.subscribe((user) => {
      this.currentUser = user ? user : undefined;
    });
  }

  ngOnInit() {
    if (!this.activity) {
      console.warn('Activity is not defined');
      return;
    }

    if (this.activity && this.activity.icon) {
      let icon: keyof typeof icons = this.activity.icon as keyof typeof icons;
      addIcons({ [icon]: icons[icon] });
    }
  }

  get color(): string {
    return this.activity!.timeSpend > 0 ? 'primary' : 'default';
  }
}

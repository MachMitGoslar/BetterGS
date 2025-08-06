import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCardContent,
  IonItem,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  IonCardTitle,
  IonCardHeader,
  IonCard,
  IonLabel,
  IonSkeletonText,
  IonAvatar,
  IonIcon,

} from '@ionic/angular/standalone';
import { ActivityListComponent } from 'src/app/components/activity-list/activity-list.component';
import { Observable } from 'rxjs';
import { Activity } from 'src/app/core/models/activity.model';
import { ApplicationService } from 'src/app/core/services/application.service';
import { ActiveTrackingBarComponent } from 'src/app/components/active-tracking-bar/active-tracking-bar.component';
import { Tracking } from 'src/app/core/models/tracking.model';
import { I18nService } from 'src/app/core/services/i18n.service';
import { stopwatch } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-my-activities',
  templateUrl: 'my_activities.page.html',
  styleUrls: ['my_activities.page.scss'],
  imports: [
    IonCardHeader,
    IonCard,
    IonLabel,
    IonIcon,
    IonCardTitle,
    IonCardContent,
    IonSkeletonText,
    IonRefresherContent,
    IonRefresher,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    IonItem,
    ActivityListComponent,
    ActiveTrackingBarComponent,
  ],
})
export class MyActivitiesPage implements OnInit {
  public isLoading = true;
  public $activities: Observable<Activity[]>;
  public activeTracking: Observable<Tracking | void> =
    this.appService.$activeTracking;

  constructor(
    public appService: ApplicationService, // Assuming ApplicationService is imported and used
    public i18nService: I18nService
  ) {
    this.$activities = this.appService.$user_activities; // Assuming getActivities() returns an Observable<Activity[]>
    this.$activities.subscribe((activities) => {
      this.isLoading = false;
      console.log('Activities loaded', activities);
    });
    addIcons({
      stopwatch
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
      console.log('Activities loaded');
    }, 500); // Simulate loading delay
  }

  handleRefresh(event: RefresherCustomEvent) {
    // Logic to refresh activities
    this.isLoading = true;
    this.appService
      .setupAppData()
      .then(() => {
        console.log('Activities refreshed successfully');
        this.isLoading = false;
        event.target.complete(); // Complete the refresher
      })
      .catch((error) => {
        console.error('Error refreshing activities:', error);
        event.target.complete(); // Complete the refresher even on error
      });
  }
}

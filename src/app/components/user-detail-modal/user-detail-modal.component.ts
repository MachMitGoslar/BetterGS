import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonModal, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonButtons, 
  IonIcon,
  IonAvatar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  ModalController
} from '@ionic/angular/standalone';
import { I18nService } from '../../core/services/i18n.service';
import { ActivityService } from '../../core/services/activity.service';
import { TrackingService } from '../../core/services/tracking.service';
import { Activity } from '../../core/models/activity.model';
import { Tracking } from '../../core/models/tracking.model';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { closeOutline, trophyOutline, timeOutline, statsChartOutline, personOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { doc, Firestore } from '@angular/fire/firestore';
import { UserPublicProfile } from 'src/app/core/models/user_public_profile.model';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';

interface UserActivityStats {
  activity: Activity;
  trackingCount: number;
  totalDuration: number;
}

@Component({
  selector: 'app-user-detail-modal',
  templateUrl: './user-detail-modal.component.html',
  styleUrls: ['./user-detail-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ElapsedTimePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonAvatar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    
  ]
})
export class UserDetailModalComponent implements OnInit {
  @Input() user!: UserPublicProfile;

  userActivityStats$: Observable<UserActivityStats[]> = of([]);
  public firestore: Firestore = inject(Firestore);

  constructor(
    public i18nService: I18nService,
    private activityService: ActivityService,
    private trackingService: TrackingService,
    private modalController: ModalController
  ) {
    addIcons({ closeOutline, trophyOutline, timeOutline, statsChartOutline, personOutline });
  }

  ngOnInit() {
    if (this.user) {
      this.loadUserActivityStats();
    }
  }

  ngOnChanges() {
    if (this.user) {
      this.loadUserActivityStats();
    }
  }

  loadUserActivityStats() {
    console.log('Loading activity stats for user:', this.user.id!);
    // Get all activities for the user and their tracking statistics
    this.userActivityStats$ = this.activityService.getActivitiesByUser(this.user.id!).pipe(
      switchMap(activities => {
        if (activities.length === 0) {
            console.warn('No activities found for user:', this.user.id);
          return of([]);
        }
        // For each activity, get its trackings and calculate stats
        const statsObservables = activities.map(activity => 
          this.trackingService.getTrackingsByActivity(this.user.id!, activity.ref!).pipe(
            map(trackings => ({
              activity,
              trackingCount: trackings.length,
              totalDuration: trackings.reduce((sum, tracking) => sum + (tracking.duration || 0), 0)
            } as UserActivityStats)),
            catchError(() => {
                console.error(`Error loading trackings for activity ${activity.id}`);
                return of({
                    activity,
                    trackingCount: 0,
                    totalDuration: 0
                    } as UserActivityStats)
                })
          )
        );
        return forkJoin(statsObservables);
      }),
      catchError(() => {
        console.error('Error loading user activity stats');
        return of([]);
      })
    );
  }



  formatDuration(milliseconds: number): string {

    if (milliseconds === 0) return '0 min';

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  closeModal() {
    this.modalController.dismiss();
  }

  get days_active(): number {
    if (!this.user.createdAt) return 0;
    const now = new Date();
    const diffTime = Math.abs(
      now.getTime() - this.user.createdAt.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  }
}

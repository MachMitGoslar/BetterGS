import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  ModalController
} from '@ionic/angular/standalone';
import { UserService } from '../../core/services/user.service';
import { I18nService } from '../../core/services/i18n.service';
import { User } from '../../core/models/user.model';
import { Observable } from 'rxjs';
import { UserDetailModalComponent } from '../../components/user-detail-modal/user-detail-modal.component';
import { trophyOutline, timeOutline, personOutline, medalOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.page.html',
  styleUrls: ['./ranking.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule,
    IonItem,
    IonLabel,
    IonAvatar,
    IonBadge,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
  ]
})
export class RankingPage implements OnInit {

  users$: Observable<User[]>;
  isLoading = true;

  constructor(
    private userService: UserService,
    public i18nService: I18nService,
    public modalController: ModalController
  ) {
    addIcons({ trophyOutline, timeOutline, personOutline, medalOutline });
    this.users$ = this.userService.getAllUsersForRanking();
  }

  ngOnInit() {
    this.loadRanking();
  }

  loadRanking() {
    this.isLoading = true;
    this.users$ = this.userService.getAllUsersForRanking();
    // Simulate loading time for better UX
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  onRefresh(event: any) {
    this.loadRanking();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
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

  getRankIcon(index: number): string {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  }

  getRankColor(index: number): string {
    switch (index) {
      case 0: return 'warning'; // Gold
      case 1: return 'medium'; // Silver
      case 2: return 'tertiary'; // Bronze
      default: return 'primary';
    }
  }

  async openModal(user: User) {
    let modal = await this.modalController.create({
      component: UserDetailModalComponent,
      componentProps: {
        user: user,
      }
    });
    modal.present();
  }

}

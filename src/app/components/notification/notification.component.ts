import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  Notification,
  NotificationService,
} from 'src/app/core/services/notification.service';
import { ToastController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  imports: [CommonModule],
})
export class NotificationComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private notificationService = inject(NotificationService);
  private toastController = inject(ToastController);
  constructor() {}

  ngOnInit() {
    this.subscription = this.notificationService.$notifications.subscribe(
      (notifications) => {
        console.log('Notifications updated:', notifications);
        // Show undisplayed notifications
        const undisplayedNotifications =
          this.notificationService.getUndisplayedNotifications();
        undisplayedNotifications.forEach((notification) => {
          this.presentToast(notification);
          this.notificationService.markNotificationAsDisplayed(notification.id);
        });
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async presentToast(notification: Notification) {
    const toast = await this.toastController.create({
      header: this.getToastHeader(notification.type),
      message: notification.message,
      duration: 3000,
      color: this.getToastColor(notification.type),
      position: 'top',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
            this.notificationService.removeNotification(notification.id);
          },
        },
      ],
    });

    await toast.present();

    // Auto-remove notification after toast is dismissed
    toast.onDidDismiss().then(() => {
      this.notificationService.removeNotification(notification.id);
    });
  }

  private getToastHeader(type: string): string {
    switch (type) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'danger':
        return 'Error';
      case 'info':
        return 'Info';
      default:
        return 'Notification';
    }
  }

  private getToastColor(type: string): string {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'danger';
      case 'info':
        return 'primary';
      default:
        return 'medium';
    }
  }
}

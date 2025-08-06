import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification, NotificationService } from 'src/app/core/services/notification.service';
import { IonToast } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  imports: [IonToast, CommonModule]
})
export class NotificationComponent  implements OnInit {

  public notifications: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications = this.notificationService.$notifications.asObservable();
  }

  ngOnInit() {}

  removeNotification(id: number): void {
    this.notificationService.removeNotification(id);
  }

}

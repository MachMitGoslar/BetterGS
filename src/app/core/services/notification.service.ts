import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { LocalNotificationDescriptor, LocalNotifications, LocalNotificationSchema, ScheduleResult } from "@capacitor/local-notifications"

export interface Notification {
  id: number;
  message: string;
  timestamp: Date;
  type: 'success' | 'info' | 'warning' | 'danger';
}
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private _notifications: Notification[] = [];
  public $notifications = new ReplaySubject<Notification[]>(1);

  private active_local_notifications: ScheduleResult[] = [];
  ;

  constructor() { }


  addNotification(msg: string, type: 'success' | 'info' | 'warning' | 'danger' = 'success'): void {
    this._notifications.push({
      id: this._notifications.length,
      message: msg,
      timestamp: new Date(),
      type: type
    });
    this.$notifications.next(this._notifications);
  }

  removeNotification(id: number): void {
    this._notifications = this._notifications.filter(n => n.id !== id);
    this.$notifications.next(this._notifications);
  }

  async scheduleLocalNotifications(notification: LocalNotificationSchema[]): Promise<void> {
    let sheduler = await LocalNotifications.schedule({
      notifications: notification.map((n) => {
        return {
          id: n.id,
          title: n.title,
          body: n.body,
          schedule: n.schedule,
          sound: n.sound || 'default',
          attachments: n.attachments || [],
          actionTypeId: n.actionTypeId || '',
          extra: n.extra || {}
        } as LocalNotificationSchema;
      })
    });
    this.active_local_notifications.push(sheduler);
  }

  async cancelLocalNotifications(notificationId: number): Promise<void> {
    let notifications = this.active_local_notifications.map(n => n.notifications)
    let notifitication_array: LocalNotificationDescriptor[] = [];
    notifications.forEach((n) => {
      n.forEach((nn) => {
        notifitication_array.push(nn);
      });
    });
    await LocalNotifications.cancel({ notifications: notifitication_array });
  }
}


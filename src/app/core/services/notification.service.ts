import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import {
  LocalNotificationDescriptor,
  LocalNotifications,
  LocalNotificationSchema,
  ScheduleResult,
} from '@capacitor/local-notifications';

/**
 * Notification interface for in-app notifications
 * @description Represents a notification object with all necessary properties
 */
export interface Notification {
  id: number;
  message: string;
  timestamp: Date;
  type: 'success' | 'info' | 'warning' | 'danger';
  displayed?: boolean; // Track if notification has been displayed
}

/**
 * NotificationService - User Notification Management Service
 * 
 * This service handles all notification-related operations in the BetterGS application,
 * including both in-app notifications and local device notifications. It provides
 * a centralized system for user feedback and engagement.
 * 
 * Key Responsibilities:
 * - In-app notification management (success, info, warning, danger)
 * - Local device notification scheduling and management
 * - Notification state tracking (displayed/undisplayed)
 * - Notification removal and cleanup
 * - Real-time notification streaming to components
 * 
 * Architecture:
 * - Uses ReplaySubject for reactive notification streams
 * - Integrates with Capacitor Local Notifications plugin
 * - Maintains internal notification state with unique IDs
 * - Provides type-safe notification interfaces
 * - Supports both immediate and scheduled notifications
 * 
 * Notification Types:
 * - success: Positive feedback (green)
 * - info: Informational messages (blue)
 * - warning: Cautionary messages (yellow)
 * - danger: Error messages (red)
 * 
 * @author BetterGS Development Team
 * @version 2.0.0
 * @since 2025-08-22
 * @Injectable
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  // ========================================
  // PRIVATE PROPERTIES
  // ========================================

  /**
   * Internal array of notifications
   * @description Stores all notifications for the current session
   * @private
   */
  private _notifications: Notification[] = [];

  /**
   * Notification ID counter
   * @description Ensures unique IDs for each notification
   * @private
   */
  private notificationIdCounter = 0;

  /**
   * Active local notifications tracker
   * @description Keeps track of scheduled local notifications
   * @private
   */
  private active_local_notifications: ScheduleResult[] = [];

  // ========================================
  // PUBLIC OBSERVABLES
  // ========================================

  /**
   * Observable stream of notifications
   * @description Provides real-time access to notification updates
   * @public
   */
  public $notifications = new ReplaySubject<Notification[]>(1);

  // ========================================
  // CONSTRUCTOR
  // ========================================

  /**
   * NotificationService Constructor
   * 
   * Initializes the service with empty notification state.
   */
  constructor() {}

  // ========================================
  // IN-APP NOTIFICATION MANAGEMENT
  // ========================================

  /**
   * Add a new in-app notification
   * 
   * Creates a new notification with a unique ID and adds it to the
   * notification stream for display in the UI.
   * 
   * @public
   * @param msg - The notification message to display
   * @param type - The type of notification (success, info, warning, danger)
   * @returns {void}
   * @since 1.0.0
   */
  addNotification(
    msg: string,
    type: 'success' | 'info' | 'warning' | 'danger' = 'success'
  ): void {
    this.notificationIdCounter++;
    this._notifications.push({
      id: this.notificationIdCounter,
      message: msg,
      timestamp: new Date(),
      type: type,
      displayed: false
    });
    this.$notifications.next(this._notifications);
  }

  /**
   * Mark notification as displayed
   * 
   * Updates the notification state to indicate it has been shown to the user.
   * This helps track which notifications still need attention.
   * 
   * @public
   * @param id - The unique ID of the notification to mark as displayed
   * @returns {void}
   * @since 1.0.0
   */
  markNotificationAsDisplayed(id: number): void {
    const notification = this._notifications.find(n => n.id === id);
    if (notification) {
      notification.displayed = true;
    }
  }

  /**
   * Get undisplayed notifications
   * 
   * Returns all notifications that haven't been marked as displayed yet.
   * Useful for showing badges or highlighting unread notifications.
   * 
   * @public
   * @returns {Notification[]} Array of undisplayed notifications
   * @since 1.0.0
   */
  getUndisplayedNotifications(): Notification[] {
    return this._notifications.filter(n => !n.displayed);
  }

  /**
   * Remove notification
   * 
   * Removes a notification from the system and updates the notification stream.
   * 
   * @public
   * @param id - The unique ID of the notification to remove
   * @returns {void}
   * @since 1.0.0
   */
  removeNotification(id: number): void {
    this._notifications = this._notifications.filter((n) => n.id !== id);
    this.$notifications.next(this._notifications);
  }

  // ========================================
  // LOCAL DEVICE NOTIFICATION MANAGEMENT
  // ========================================

  /**
   * Schedule local device notifications
   * 
   * Schedules notifications to be displayed by the device even when
   * the app is not in the foreground. Useful for reminders and alerts.
   * 
   * @public
   * @param notification - Array of notification schemas to schedule
   * @returns {Promise<void>} Promise that resolves when notifications are scheduled
   * @since 1.0.0
   */
  async scheduleLocalNotifications(
    notification: LocalNotificationSchema[]
  ): Promise<void> {
    const scheduler = await LocalNotifications.schedule({
      notifications: notification.map((n) => {
        return {
          id: n.id,
          title: n.title,
          body: n.body,
          schedule: n.schedule,
          sound: n.sound || 'default',
          attachments: n.attachments || [],
          actionTypeId: n.actionTypeId || '',
          extra: n.extra || {},
        } as LocalNotificationSchema;
      }),
    });
    this.active_local_notifications.push(scheduler);
  }

  /**
   * Cancel local device notifications
   * 
   * Cancels previously scheduled local notifications to prevent
   * them from being displayed.
   * 
   * @public
   * @param notificationId - The ID of the notification to cancel
   * @returns {Promise<void>} Promise that resolves when notifications are cancelled
   * @since 1.0.0
   */
  async cancelLocalNotifications(notificationId: number): Promise<void> {
    const notifications = this.active_local_notifications.map(
      (n) => n.notifications
    );
    const notificationArray: LocalNotificationDescriptor[] = [];
    
    notifications.forEach((n) => {
      n.forEach((nn) => {
        notificationArray.push(nn);
      });
    });
    
    await LocalNotifications.cancel({ notifications: notificationArray });
  }

}

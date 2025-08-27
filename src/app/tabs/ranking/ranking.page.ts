import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
  ModalController,
} from '@ionic/angular/standalone';
import { UserService } from '../../core/services/user.service';
import { I18nService } from '../../core/services/i18n.service';
import { Observable, Subscription } from 'rxjs';
import { UserDetailModalComponent } from '../../components/user-detail-modal/user-detail-modal.component';
import {
  trophyOutline,
  timeOutline,
  personOutline,
  medalOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { UserPublicProfile } from 'src/app/core/models/user_public_profile.model';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';
import { ActiveTrackingBarComponent } from 'src/app/components/active-tracking-bar/active-tracking-bar.component';

/**
 * RankingPage Component
 *
 * A comprehensive user ranking and leaderboard interface that displays users
 * sorted by their activity metrics. Features include real-time updates,
 * pull-to-refresh functionality, detailed user modals, and responsive design.
 *
 * The component provides an engaging way for users to view community rankings
 * based on tracked time and number of activities, promoting healthy competition
 * and community engagement within the application.
 *
 * @example
 * ```html
 * <app-ranking></app-ranking>
 * ```
 *
 * @category Page Components
 * @since 1.0.0
 * @author BetterGS Team
 */
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
    ElapsedTimePipe,
    ActiveTrackingBarComponent,
  ],
})
export class RankingPage implements OnInit, OnDestroy {
  // ==========================================
  // Public State Properties
  // ==========================================

  /**
   * Observable stream of user profiles for ranking display
   * Provides real-time updates when user data changes
   *
   * @description Stream containing all users sorted by ranking criteria
   * @type {Observable<UserPublicProfile[]>}
   * @since 1.0.0
   */
  users$!: Observable<UserPublicProfile[]>;

  /**
   * Loading state indicator for UI feedback
   * Controls skeleton loading display and data fetching states
   *
   * @description True when data is being loaded, false when complete
   * @type {boolean}
   * @default true
   * @since 1.0.0
   */
  isLoading = true;

  // ==========================================
  // Private Properties
  // ==========================================

  /**
   * Subscription management for memory cleanup
   * Stores all component subscriptions for proper disposal
   *
   * @description Array of subscriptions to clean up on destroy
   * @type {Subscription[]}
   * @private
   * @since 1.0.0
   */
  private subscriptions: Subscription[] = [];

  /**
   * Default refresh timeout duration in milliseconds
   * Controls the minimum time for refresh animation
   *
   * @description Timeout for refresh completion feedback
   * @type {number}
   * @private
   * @readonly
   * @since 1.0.0
   */
  private readonly REFRESH_TIMEOUT = 1000;

  // ==========================================
  // Constructor & Initialization
  // ==========================================

  /**
   * Constructs the RankingPage component
   *
   * Initializes the component with required services, sets up icon registry,
   * and prepares the observable stream for user ranking data.
   *
   * @description Creates component instance with service dependencies
   * @param {UserService} userService - Service for user data operations
   * @param {I18nService} i18nService - Service for internationalization
   * @param {ModalController} modalController - Controller for modal dialogs
   * @since 1.0.0
   */

  private userService = inject(UserService);
  public i18nService = inject(I18nService);
  public modalController = inject(ModalController);

  constructor() {
    this.registerIcons();
    this.initializeObservables();
  }

  // ==========================================
  // Lifecycle Methods
  // ==========================================

  /**
   * Component initialization lifecycle hook
   *
   * Triggers the initial data loading when the component is initialized.
   * Sets up the ranking data stream and begins the loading process.
   *
   * @description Handles component initialization and data loading
   * @returns {void}
   * @since 1.0.0
   */
  ngOnInit(): void {
    this.loadRanking();
  }

  /**
   * Component destruction lifecycle hook
   *
   * Performs cleanup operations to prevent memory leaks by unsubscribing
   * from all active subscriptions and releasing resources.
   *
   * @description Handles component cleanup and memory management
   * @returns {void}
   * @since 1.0.0
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
    });
    this.subscriptions = [];
  }

  // ==========================================
  // Initialization Methods
  // ==========================================

  /**
   * Registers required icons for the component
   *
   * Sets up the icon registry with all icons used in the ranking interface.
   * This ensures icons are available for template usage.
   *
   * @description Initializes icon registry with ranking-related icons
   * @returns {void}
   * @private
   * @since 1.0.0
   */
  private registerIcons(): void {
    addIcons({
      trophyOutline,
      timeOutline,
      personOutline,
      medalOutline,
    });
  }

  /**
   * Initializes observable streams for component data
   *
   * Sets up the users observable stream with an empty initial state.
   * This prevents null/undefined errors during component initialization.
   *
   * @description Prepares observable streams for data management
   * @returns {void}
   * @private
   * @since 1.0.0
   */
  private initializeObservables(): void {
    this.users$ = new Observable<UserPublicProfile[]>();
  }

  // ==========================================
  // Data Loading Methods
  // ==========================================

  /**
   * Loads ranking data from the server
   *
   * Initiates the data loading process by requesting user ranking information
   * from the UserService. Manages loading state to provide user feedback
   * during the data fetching process.
   *
   * @description Fetches and initializes user ranking data
   * @returns {void}
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * // Manually trigger ranking reload
   * this.loadRanking();
   * ```
   */
  loadRanking(): void {
    this.isLoading = true;
    this.users$ = this.userService.getAllUsersForRanking();
    this.isLoading = false;
  }

  /**
   * Handles pull-to-refresh functionality
   *
   * Responds to user pull-to-refresh gestures by reloading ranking data
   * and providing appropriate feedback. Ensures minimum refresh duration
   * for smooth user experience.
   *
   * @description Processes refresh events and reloads data
   * @param {any} event - The Ionic refresh event object
   * @returns {void}
   * @since 1.0.0
   *
   * @example
   * ```html
   * <ion-refresher (ionRefresh)="onRefresh($event)">
   *   <ion-refresher-content></ion-refresher-content>
   * </ion-refresher>
   * ```
   */
  onRefresh(event: any): void {
    this.loadRanking();

    setTimeout(() => {
      if (event && event.target) {
        event.target.complete();
      }
    }, this.REFRESH_TIMEOUT);
  }

  // ==========================================
  // Data Formatting Utilities
  // ==========================================

  /**
   * Formats duration from milliseconds to readable string
   *
   * Converts millisecond duration values into human-readable time format
   * with hours and minutes. Handles edge cases and provides fallback values.
   *
   * @description Converts milliseconds to readable time format
   * @param {number | undefined} milliseconds - Duration in milliseconds
   * @returns {string} Formatted duration string (e.g., "2h 30m", "45m")
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * formatDuration(7200000); // Returns "2h 0m"
   * formatDuration(1800000); // Returns "30m"
   * formatDuration(0);       // Returns "0 min"
   * formatDuration(undefined); // Returns "0 min"
   * ```
   */
  formatDuration(milliseconds: number | undefined): string {
    if (milliseconds === 0 || milliseconds === undefined) {
      return '0 min';
    }

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Generates user initials from display name
   *
   * Creates a two-character initial string from user's name for avatar
   * placeholder display. Handles various name formats and edge cases.
   *
   * @description Extracts initials from user name for avatar display
   * @param {string} name - User's display name
   * @returns {string} Two-character initial string in uppercase
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * getInitials("John Doe");        // Returns "JD"
   * getInitials("Jane");            // Returns "J"
   * getInitials("Mary Jane Smith"); // Returns "MJ"
   * getInitials("");                // Returns ""
   * ```
   */
  getInitials(name: string): string {
    if (!name || name.trim().length === 0) {
      return '';
    }

    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // ==========================================
  // Ranking Display Utilities
  // ==========================================

  /**
   * Gets display icon for ranking position
   *
   * Returns appropriate emoji or text representation for user's rank position.
   * Provides special icons for top 3 positions and numbered badges for others.
   *
   * @description Determines rank display icon based on position
   * @param {number} index - Zero-based ranking index
   * @returns {string} Rank icon or text representation
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * getRankIcon(0); // Returns "🥇" (gold medal)
   * getRankIcon(1); // Returns "🥈" (silver medal)
   * getRankIcon(2); // Returns "🥉" (bronze medal)
   * getRankIcon(3); // Returns "#4"
   * getRankIcon(9); // Returns "#10"
   * ```
   */
  getRankIcon(index: number): string {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `#${index + 1}`;
    }
  }

  /**
   * Gets color theme for ranking position
   *
   * Returns appropriate Ionic color theme for styling rank badges
   * based on user's position. Provides visual hierarchy for rankings.
   *
   * @description Determines color theme for rank styling
   * @param {number} index - Zero-based ranking index
   * @returns {string} Ionic color name for theming
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * getRankColor(0); // Returns "warning" (gold theme)
   * getRankColor(1); // Returns "medium" (silver theme)
   * getRankColor(2); // Returns "tertiary" (bronze theme)
   * getRankColor(5); // Returns "primary" (default theme)
   * ```
   */
  getRankColor(index: number): string {
    switch (index) {
      case 0:
        return 'warning'; // Gold
      case 1:
        return 'medium'; // Silver
      case 2:
        return 'tertiary'; // Bronze
      default:
        return 'primary'; // Default
    }
  }

  // ==========================================
  // Modal Management
  // ==========================================

  /**
   * Opens user detail modal for selected user
   *
   * Creates and presents a modal dialog containing detailed information
   * about the selected user. Handles modal creation, configuration,
   * and presentation with proper error handling.
   *
   * @description Creates and displays user detail modal
   * @param {UserPublicProfile} user - User profile to display in modal
   * @returns {Promise<void>} Promise that resolves when modal is presented
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * // Open modal for specific user
   * await this.openModal(userProfile);
   * ```
   *
   * @example
   * ```html
   * <ion-item (click)="openModal(user)">
   *   <!-- User item content -->
   * </ion-item>
   * ```
   */
  async openModal(user: UserPublicProfile): Promise<void> {
    try {
      const modal = await this.modalController.create({
        component: UserDetailModalComponent,
        componentProps: {
          user: user,
        },
        breakpoints: [0, 0.25, 0.5, 0.75],
        initialBreakpoint: 0.5,
      });

      await modal.present();
    } catch (error) {
      console.error('Error opening user detail modal:', error);
    }
  }

  // ==========================================
  // Utility Methods
  // ==========================================

  /**
   * Checks if a ranking position is in the top three
   *
   * Utility method to determine if a user's ranking position qualifies
   * for special top-three styling and treatment.
   *
   * @description Determines if position is in top three rankings
   * @param {number} index - Zero-based ranking index
   * @returns {boolean} True if position is in top three
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * isTopThree(0); // Returns true (1st place)
   * isTopThree(2); // Returns true (3rd place)
   * isTopThree(3); // Returns false (4th place)
   * ```
   */
  isTopThree(index: number): boolean {
    return index < 3;
  }

  /**
   * Checks if user has a profile picture
   *
   * Utility method to determine if a user has a valid profile picture URL
   * for conditional rendering logic.
   *
   * @description Checks for valid profile picture URL
   * @param {UserPublicProfile} user - User profile to check
   * @returns {boolean} True if user has profile picture
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * hasProfilePicture(user); // Returns true if user.profilePictureUrl exists
   * ```
   */
  hasProfilePicture(user: UserPublicProfile): boolean {
    return !!(
      user.profilePictureUrl && user.profilePictureUrl.trim().length > 0
    );
  }

  /**
   * Gets display name with fallback
   *
   * Returns user's display name with appropriate fallback for cases
   * where name is not available or empty.
   *
   * @description Gets user display name with fallback handling
   * @param {UserPublicProfile} user - User profile
   * @returns {string} Display name or fallback text
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * getDisplayName(user); // Returns user.name or "Unknown User"
   * ```
   */
  getDisplayName(user: UserPublicProfile): string {
    return user.name && user.name.trim().length > 0
      ? user.name
      : this.i18nService.getTranslation('user.unknownUser');
  }

  /**
   * Formats tracking session count
   *
   * Formats the number of tracking sessions with appropriate pluralization
   * and localization support.
   *
   * @description Formats session count with proper localization
   * @param {number} count - Number of tracking sessions
   * @returns {string} Formatted session count string
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * formatSessionCount(1); // Returns "1 session"
   * formatSessionCount(5); // Returns "5 sessions"
   * ```
   */
  formatSessionCount(count: number): string {
    const sessionKey = count === 1 ? 'ranking.session' : 'ranking.sessions';
    return `${count} ${this.i18nService.getTranslation(sessionKey)}`;
  }

  /**
   * Checks if ranking data is empty
   *
   * Utility method to determine if the ranking list is empty for
   * conditional empty state display.
   *
   * @description Checks if users array is empty
   * @param {UserPublicProfile[] | null} users - Array of user profiles
   * @returns {boolean} True if users array is empty or null
   * @since 1.0.0
   *
   * @example
   * ```typescript
   * isEmptyRanking([]); // Returns true
   * isEmptyRanking(null); // Returns true
   * isEmptyRanking([user1, user2]); // Returns false
   * ```
   */
  isEmptyRanking(users: UserPublicProfile[] | null): boolean {
    return !users || users.length === 0;
  }
}

import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

/**
 * ActivityCardComponent - Reusable Activity Display Card
 *
 * A lightweight component for displaying activity-related information with
 * an icon and value. Used throughout the application for consistent
 * activity data presentation.
 *
 * Key Features:
 * - Configurable icon and value display
 * - Lightweight standalone component
 * - Ionic icon integration
 * - Consistent styling and theming
 *
 * Usage:
 * ```html
 * <app-activity-card
 *   icon="trophy"
 *   value="120">
 * </app-activity-card>
 * ```
 *
 * @author BetterGS Development Team
 * @version 1.0.0
 * @since 2025
 */
@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class ActivityCardComponent {
  /**
   * Icon name to display in the card
   * Uses Ionic icon names (e.g., 'time', 'trophy', 'star')
   * @default 'time'
   */
  @Input() icon: string = 'time';

  /**
   * Value to display in the card
   * Typically represents time in seconds or other activity metrics
   * @default ''
   */
  @Input() value: string = '';
}

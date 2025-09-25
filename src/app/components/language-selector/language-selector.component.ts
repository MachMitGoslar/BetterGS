import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonIcon,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { I18nService, Language } from 'src/app/core/services/i18n.service';
import { addIcons } from 'ionicons';
import { globeOutline, checkmark } from 'ionicons/icons';

/**
 * LanguageSelectorComponent - Internationalization Language Switcher
 *
 * A component that provides users with the ability to switch between
 * supported application languages through an action sheet interface.
 *
 * Key Features:
 * - Action sheet-based language selection UI
 * - Real-time language switching with instant updates
 * - Visual language indicators with flags and names
 * - Integration with I18nService for language management
 * - Responsive design for mobile and desktop platforms
 *
 * Supported Languages:
 * - German (Deutsch) - Primary language
 * - English - Secondary language
 *
 * Technical Details:
 * - Subscribes to language changes for real-time updates
 * - Uses Ionic ActionSheetController for native-like UI
 * - Manages subscriptions for memory leak prevention
 * - Integrates with Angular i18n localization system
 *
 * Dependencies:
 * - I18nService: Language management and switching
 * - ActionSheetController: Native action sheet presentation
 * - Ionicons: Globe and checkmark icons
 *
 * Usage:
 * ```html
 * <app-language-selector></app-language-selector>
 * ```
 *
 * @author BetterGS Development Team
 * @version 1.0.0
 * @since 2025
 */
@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  /**
   * Currently selected language object with code, name, and flag
   * Updated automatically when language changes
   */
  currentLanguage: Language = { code: 'en', name: 'English', flag: '🇺🇸' };

  /**
   * Array of RxJS subscriptions for cleanup on component destruction
   */
  private subscriptions: Subscription[] = [];

  /**
   * Internationalization service for language management
   */
  private i18nService = inject(I18nService);

  /**
   * Ionic action sheet controller for language selection UI
   */
  private actionSheetController = inject(ActionSheetController);
  constructor() {
    this.setupIcons();
  }

  ngOnInit() {
    // Subscribe to language changes
    const langSub = this.i18nService.currentLanguage$.subscribe(() => {
      this.currentLanguage = this.i18nService.getCurrentLanguageObject();
    });
    this.subscriptions.push(langSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Sets up Ionicons
   */
  private setupIcons() {
    addIcons({
      'globe-outline': globeOutline,
      checkmark: checkmark,
    });
  }

  /**
   * Opens language selection action sheet
   */
  async openLanguageSelector() {
    const currentLang = this.i18nService.getCurrentLanguage();

    const buttons = [
      ...this.i18nService.supportedLanguages.map((language) => ({
        text: `${language.flag} ${language.name}`,
        icon: language.code === currentLang ? 'checkmark' : undefined,
        handler: () => {
          this.selectLanguage(language.code);
        },
      })),
      {
        text: this.i18nService.getTranslation('common.cancel'),
        role: 'cancel' as const,
        handler: () => {},
      },
    ];

    const actionSheet = await this.actionSheetController.create({
      header: this.i18nService.getTranslation('language.selector'),
      buttons: buttons,
    });

    await actionSheet.present();
  }

  /**
   * Selects a new language
   */
  private selectLanguage(languageCode: string) {
    if (languageCode !== this.i18nService.getCurrentLanguage()) {
      // For full i18n support with Angular, we would reload with new locale
      this.i18nService.changeLanguageAndReload(languageCode);
    }
  }
}

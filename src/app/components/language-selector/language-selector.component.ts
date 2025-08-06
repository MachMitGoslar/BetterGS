import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ActionSheetController,
} from '@ionic/angular';
import {
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { I18nService, Language } from 'src/app/core/services/i18n.service';
import { addIcons } from 'ionicons';
import { globeOutline, checkmark } from 'ionicons/icons';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],  
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
  ],
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
  currentLanguage: Language = { code: 'en', name: 'English', flag: '🇺🇸' };
  
  private subscriptions: Subscription[] = [];

  constructor(
    private i18nService: I18nService,
    private actionSheetController: ActionSheetController
  ) {
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
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Sets up Ionicons
   */
  private setupIcons() {
    addIcons({
      'globe-outline': globeOutline,
      'checkmark': checkmark,
    });
  }

  /**
   * Opens language selection action sheet
   */
  async openLanguageSelector() {
    const currentLang = this.i18nService.getCurrentLanguage();
    
    const buttons = [
      ...this.i18nService.supportedLanguages.map(language => ({
        text: `${language.flag} ${language.name}`,
        icon: language.code === currentLang ? 'checkmark' : undefined,
        handler: () => {
          this.selectLanguage(language.code);
        }
      })),
      {
        text: this.i18nService.getTranslation('common.cancel'),
        role: 'cancel' as const,
        handler: () => {}
      }
    ];

    const actionSheet = await this.actionSheetController.create({
      header: this.i18nService.getTranslation('language.selector'),
      buttons: buttons
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

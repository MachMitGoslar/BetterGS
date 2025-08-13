import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { translations } from '../../../locale/translations';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private currentLanguageSubject = new BehaviorSubject<string>('de');
  public currentLanguage$: Observable<string> = this.currentLanguageSubject.asObservable();

  public readonly supportedLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  constructor(@Inject(LOCALE_ID) private localeId: string) {
    // Set initial language from locale or localStorage
    const savedLanguage = this.getSavedLanguage();
    const initialLanguage = savedLanguage || this.localeId || 'de';
    this.setLanguage(initialLanguage);
  }

  /**
   * Gets the current language code
   */
  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Sets the current language
   */
  setLanguage(languageCode: string): void {
    if (this.isLanguageSupported(languageCode)) {
      this.currentLanguageSubject.next(languageCode);
      this.saveLanguage(languageCode);
    }
  }

  /**
   * Gets the current language object
   */
  getCurrentLanguageObject(): Language {
    const currentCode = this.getCurrentLanguage();
    return this.supportedLanguages.find(lang => lang.code === currentCode) || this.supportedLanguages[0];
  }

  /**
   * Checks if a language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.some(lang => lang.code === languageCode);
  }

  /**
   * Gets browser language preference
   */
  getBrowserLanguage(): string {
    const browserLang = navigator.language.split('-')[0];
    return this.isLanguageSupported(browserLang) ? browserLang : 'de';
  }

  /**
   * Saves language preference to localStorage
   */
  private saveLanguage(languageCode: string): void {
    localStorage.setItem('selectedLanguage', languageCode);
  }

  /**
   * Gets saved language from localStorage
   */
  private getSavedLanguage(): string | null {
    return localStorage.getItem('selectedLanguage');
  }

  /**
   * Gets translations for common UI elements
   * Note: This is a fallback method. In production, you should use Angular i18n
   */
  getTranslation(key: string): string {
    const currentLang = this.getCurrentLanguage();
    
    

    return translations[key]?.[currentLang] || key;
  }

  /**
   * Formats date according to current locale
   */
  formatDate(date: Date): string {
    const currentLang = this.getCurrentLanguage();
    const locale = currentLang === 'de' ? 'de-DE' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Formats number according to current locale
   */
  formatNumber(num: number): string {
    const currentLang = this.getCurrentLanguage();
    const locale = currentLang === 'de' ? 'de-DE' : 'en-US';
    
    return new Intl.NumberFormat(locale).format(num);
  }

  /**
   * Changes language and reloads the page (for full i18n support)
   */
  changeLanguageAndReload(languageCode: string): void {
    if (this.isLanguageSupported(languageCode)) {
      this.setLanguage(languageCode);
      // In a production app with proper Angular i18n, you would:
      // window.location.href = `/${languageCode}${window.location.pathname}`;
      // if(environment.production) {
      // console.log('Reloading to:', `./${languageCode}/index.html`);
      //   window.location.href = `./${languageCode}/index.html`;
      // // } else {
         // window.location.reload();
      // // }
    }
  }
}

import { Injectable, LOCALE_ID, Inject, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { translations } from '../../../locale/translations';

/**
 * Language interface for supported languages
 * @description Represents a language configuration with code, name, and flag
 */
export interface Language {
  code: string;
  name: string;
  flag: string;
}

/**
 * I18nService - Internationalization Service
 * 
 * This service handles all internationalization (i18n) and localization (l10n)
 * operations in the BetterGS application. It provides language switching,
 * translation management, and locale-specific formatting.
 * 
 * Key Responsibilities:
 * - Language switching and persistence
 * - Translation key resolution
 * - Locale-specific date and number formatting
 * - Browser language detection
 * - Language preference storage
 * - Real-time language change notifications
 * 
 * Architecture:
 * - Uses BehaviorSubject for reactive language changes
 * - Integrates with Angular's LOCALE_ID injection token
 * - Supports localStorage for language persistence
 * - Provides fallback mechanisms for missing translations
 * - Uses native Intl API for locale-specific formatting
 * 
 * Supported Languages:
 * - English (en) - 🇺🇸
 * - German (de) - 🇩🇪
 * 
 * @author BetterGS Development Team
 * @version 2.0.0
 * @since 2025-08-22
 * @Injectable
 */
@Injectable({
  providedIn: 'root',
})
export class I18nService {

  // ========================================
  // PRIVATE PROPERTIES
  // ========================================

  /**
   * Current language subject for reactive updates
   * @description BehaviorSubject that emits language changes
   * @private
   */
  private currentLanguageSubject = new BehaviorSubject<string>('de');

  // ========================================
  // PUBLIC OBSERVABLES
  // ========================================

  /**
   * Observable stream of current language
   * @description Provides real-time access to language changes
   * @public
   */
  public currentLanguage$: Observable<string> = this.currentLanguageSubject.asObservable();

  // ========================================
  // PUBLIC CONSTANTS
  // ========================================

  /**
   * Array of supported languages
   * @description Configuration for all languages supported by the application
   * @public
   */
  public readonly supportedLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  // ========================================
  // CONSTRUCTOR & INITIALIZATION
  // ========================================

  /**
   * I18nService Constructor
   * 
   * Initializes the service with the user's preferred language from
   * localStorage, Angular's LOCALE_ID, or defaults to German.
   * 
   * @param localeId - Angular's injected LOCALE_ID token
   */

  private localeId = inject(LOCALE_ID);

  constructor() {
    // Set initial language from locale or localStorage
    const savedLanguage = this.getSavedLanguage();
    const initialLanguage = savedLanguage || this.localeId || 'de';
    this.setLanguage(initialLanguage);
  }

  // ========================================
  // LANGUAGE MANAGEMENT
  // ========================================

  /**
   * Get the current language code
   * 
   * Returns the currently active language code.
   * 
   * @public
   * @returns {string} Current language code (e.g., 'en', 'de')
   * @since 1.0.0
   */
  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Set the current language
   * 
   * Changes the active language and persists the preference to localStorage.
   * Only accepts supported language codes.
   * 
   * @public
   * @param languageCode - The language code to set
   * @returns {void}
   * @since 1.0.0
   */
  setLanguage(languageCode: string): void {
    if (this.isLanguageSupported(languageCode)) {
      this.currentLanguageSubject.next(languageCode);
      this.saveLanguage(languageCode);
    }
  }

  /**
   * Get the current language object
   * 
   * Returns the complete language object for the current language,
   * including code, name, and flag.
   * 
   * @public
   * @returns {Language} Current language object
   * @since 1.0.0
   */
  getCurrentLanguageObject(): Language {
    const currentCode = this.getCurrentLanguage();
    return this.supportedLanguages.find(lang => lang.code === currentCode) || this.supportedLanguages[0];
  }

  /**
   * Check if a language is supported
   * 
   * Validates whether a given language code is in the list of supported languages.
   * 
   * @public
   * @param languageCode - The language code to check
   * @returns {boolean} True if language is supported, false otherwise
   * @since 1.0.0
   */
  isLanguageSupported(languageCode: string): boolean {
    return this.supportedLanguages.some(lang => lang.code === languageCode);
  }

  /**
   * Get browser language preference
   * 
   * Detects the user's browser language and returns it if supported,
   * otherwise returns the default language (German).
   * 
   * @public
   * @returns {string} Supported browser language or default language
   * @since 1.0.0
   */
  getBrowserLanguage(): string {
    const browserLang = navigator.language.split('-')[0];
    return this.isLanguageSupported(browserLang) ? browserLang : 'de';
  }

  /**
   * Change language and reload page
   * 
   * Changes the language and optionally reloads the page for full i18n support.
   * In production apps with proper Angular i18n, this would redirect to
   * the appropriate locale-specific route.
   * 
   * @public
   * @param languageCode - The language code to switch to
   * @returns {void}
   * @since 1.0.0
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

  // ========================================
  // PRIVATE UTILITY METHODS
  // ========================================

  /**
   * Save language preference to localStorage
   * 
   * Persists the selected language to browser storage for future sessions.
   * 
   * @private
   * @param languageCode - The language code to save
   * @returns {void}
   * @since 1.0.0
   */
  private saveLanguage(languageCode: string): void {
    localStorage.setItem('selectedLanguage', languageCode);
  }

  /**
   * Get saved language from localStorage
   * 
   * Retrieves the previously saved language preference from browser storage.
   * 
   * @private
   * @returns {string | null} Saved language code or null if not found
   * @since 1.0.0
   */
  private getSavedLanguage(): string | null {
    return localStorage.getItem('selectedLanguage');
  }

  // ========================================
  // TRANSLATION & FORMATTING
  // ========================================

  /**
   * Get translation for a key
   * 
   * Retrieves the translated text for a given translation key in the current language.
   * Falls back to the key itself if translation is not found.
   * 
   * Note: This is a fallback method. In production, you should use Angular i18n.
   * 
   * @public
   * @param key - The translation key to look up
   * @returns {string} Translated text or the key if translation not found
   * @since 1.0.0
   */
  getTranslation(key: string): string {
    const currentLang = this.getCurrentLanguage();
    return translations[key]?.[currentLang] || key;
  }

  /**
   * Format date according to current locale
   * 
   * Formats a date using the current language's locale settings.
   * 
   * @public
   * @param date - The date to format
   * @returns {string} Formatted date string
   * @since 1.0.0
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
   * Format number according to current locale
   * 
   * Formats a number using the current language's locale settings.
   * 
   * @public
   * @param num - The number to format
   * @returns {string} Formatted number string
   * @since 1.0.0
   */
  formatNumber(num: number): string {
    const currentLang = this.getCurrentLanguage();
    const locale = currentLang === 'de' ? 'de-DE' : 'en-US';
    
    return new Intl.NumberFormat(locale).format(num);
  }

}

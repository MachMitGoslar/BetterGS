import { Injectable, LOCALE_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$: Observable<string> = this.currentLanguageSubject.asObservable();

  public readonly supportedLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  constructor(@Inject(LOCALE_ID) private localeId: string) {
    // Set initial language from locale or localStorage
    const savedLanguage = this.getSavedLanguage();
    const initialLanguage = savedLanguage || this.localeId || 'en';
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
    return this.isLanguageSupported(browserLang) ? browserLang : 'en';
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
    
    const translations: { [key: string]: { [lang: string]: string } } = {
      'app.title': {
        en: 'BetterGS',
        de: 'BetterGS'
      },
      'common.cancel': {
        en: 'Cancel',
        de: 'Abbrechen'
      },
      'common.save': {
        en: 'Save',
        de: 'Speichern'
      },
      'common.delete': {
        en: 'Delete',
        de: 'Löschen'
      },
      'common.close': {
        en: 'Close',
        de: 'Schließen'
      },
      'common.back': {
        en: 'Back',
        de: 'Zurück'
      },
      'language.selector': {
        en: 'Language',
        de: 'Sprache'
      },
      // Error Messages
      'error.no.user.logged.in': {
        en: 'No user logged in',
        de: 'Kein Benutzer angemeldet'
      },
      'error.activity.not.available': {
        en: 'Activity or tracking data is not available',
        de: 'Aktivität oder Tracking-Daten sind nicht verfügbar'
      },
      'error.tracking.not.available': {
        en: 'No active tracking to stop',
        de: 'Kein aktives Tracking zum Beenden'
      },
      'error.user.registration': {
        en: 'Error registering user',
        de: 'Fehler bei der Benutzerregistrierung'
      },
      'error.password.change': {
        en: 'Error changing password',
        de: 'Fehler beim Ändern des Passworts'
      },
      'error.profile.update': {
        en: 'Error updating profile',
        de: 'Fehler beim Aktualisieren des Profils'
      },
      'error.logout': {
        en: 'Error logging out',
        de: 'Fehler beim Abmelden'
      },
      'error.no.user.to.logout': {
        en: 'No user logged in to log out',
        de: 'Kein Benutzer zum Abmelden angemeldet'
      },
      'error.login': {
        en: 'Login failed',
        de: 'Anmeldung fehlgeschlagen'
      },
      'error.anonymous.login': {
        en: 'Anonymous login failed',
        de: 'Anonyme Anmeldung fehlgeschlagen'
      },
      'error.password.reset': {
        en: 'Failed to send password reset',
        de: 'Fehler beim Senden der Passwort-Reset-E-Mail'
      },
      'error.account.creation': {
        en: 'Account creation failed',
        de: 'Kontoerstellung fehlgeschlagen'
      },
      // Success Messages
      'success.tracking.stopped': {
        en: 'Tracking stopped successfully',
        de: 'Tracking erfolgreich beendet'
      },
      'success.user.registered': {
        en: 'User registered successfully',
        de: 'Benutzer erfolgreich registriert'
      },
      'success.password.changed': {
        en: 'Password changed successfully',
        de: 'Passwort erfolgreich geändert'
      },
      'success.profile.updated': {
        en: 'Profile updated successfully',
        de: 'Profil erfolgreich aktualisiert'
      },
      'success.logged.out': {
        en: 'Logged out successfully',
        de: 'Erfolgreich abgemeldet'
      },
      'success.login': {
        en: 'Login successful',
        de: 'Anmeldung erfolgreich'
      },
      'success.anonymous.login': {
        en: 'Signed in as guest',
        de: 'Als Gast angemeldet'
      },
      'success.password.reset.sent': {
        en: 'Password reset email sent',
        de: 'Passwort-Reset-E-Mail gesendet'
      },
      'success.account.created': {
        en: 'Account created successfully',
        de: 'Konto erfolgreich erstellt'
      },
      // Tracking specific translations
      'tracking.success.dataSaved': {
        en: 'Tracking data saved successfully',
        de: 'Tracking-Daten erfolgreich gespeichert'
      },
      'tracking.error.userRefRequired': {
        en: 'User reference is required to save tracking data',
        de: 'Benutzerreferenz ist erforderlich um Tracking-Daten zu speichern'
      },
      'tracking.error.activityRefRequired': {
        en: 'Activity reference is required to save tracking data',
        de: 'Aktivitätsreferenz ist erforderlich um Tracking-Daten zu speichern'
      },
      'tracking.error.saveFailed': {
        en: 'Error saving tracking data: ',
        de: 'Fehler beim Speichern der Tracking-Daten: '
      },
      'tracking.error.referencesRequired': {
        en: 'User and activity references are required to upload an image',
        de: 'Benutzer- und Aktivitätsreferenzen sind erforderlich um ein Bild hochzuladen'
      },
      'tracking.localNotifications.startTracking': {
        en: 'Your Tracking is still running',
        de: 'Tracking läuft noch'
      },
      // Activity specific translations
      'activity.success.created': {
        en: 'Activity successfully created',
        de: 'Aktivität erfolgreich erstellt'
      },
      'activity.success.updated': {
        en: 'Activity successfully updated',
        de: 'Aktivität erfolgreich aktualisiert'
      },
      'activity.error.creationFailed': {
        en: 'Error creating activity: ',
        de: 'Fehler beim Erstellen der Aktivität: '
      },
      'activity.error.updateFailed': {
        en: 'Error updating activity',
        de: 'Fehler beim Aktualisieren der Aktivität'
      },
      // Ranking specific translations
      'ranking.title': {
        en: 'Ranking',
        de: 'Rangliste'
      },
      'ranking.leaderboard': {
        en: 'Leaderboard',
        de: 'Bestenliste'
      },
      'ranking.description': {
        en: 'See how you compare with other users based on activity time and sessions.',
        de: 'Sehen Sie, wie Sie im Vergleich zu anderen Benutzern basierend auf Aktivitätszeit und Sitzungen abschneiden.'
      },
      'ranking.totalTime': {
        en: 'Total Time',
        de: 'Gesamtzeit'
      },
      'ranking.totalTrackings': {
        en: 'Total Sessions',
        de: 'Gesamte Sitzungen'
      },
      'ranking.daysActive': {
        en: 'Days Active',
        de: 'Aktive Tage'
      },
      'ranking.sessions': {
        en: 'sessions',
        de: 'Sitzungen'
      },
      'ranking.noUsers': {
        en: 'No Users Found',
        de: 'Keine Benutzer gefunden'
      },
      'ranking.noUsersDescription': {
        en: 'There are currently no users to display in the ranking.',
        de: 'Es gibt derzeit keine Benutzer, die in der Rangliste angezeigt werden können.'
      },
      'ranking.userDetails': {
        en: 'User Details',
        de: 'Benutzerdetails'
      },
      'ranking.statistics': {
        en: 'Statistics',
        de: 'Statistiken'
      },
      'ranking.activityBreakdown': {
        en: 'Activity Breakdown',
        de: 'Aktivitätsaufschlüsselung'
      },
      'ranking.noActivities': {
        en: 'No activities found for this user.',
        de: 'Keine Aktivitäten für diesen Benutzer gefunden.'
      },
      'user.status.active': {
        en: 'Active',
        de: 'Aktiv'
      },
      // Profile picture upload translations
      'profile.error.fileTooLarge': {
        en: 'File size too large. Please select a file smaller than 5MB.',
        de: 'Datei zu groß. Bitte wählen Sie eine Datei kleiner als 5MB.'
      },
      'profile.error.invalidFileType': {
        en: 'Invalid file type. Please select an image file.',
        de: 'Ungültiger Dateityp. Bitte wählen Sie eine Bilddatei.'
      },
      'profile.error.uploadFailed': {
        en: 'Failed to upload image. Please try again.',
        de: 'Bild-Upload fehlgeschlagen. Bitte versuchen Sie es erneut.'
      },
      'profile.success.pictureUploaded': {
        en: 'Profile picture uploaded successfully!',
        de: 'Profilbild erfolgreich hochgeladen!'
      },
      'profile.changePicture': {
        en: 'Change Profile Picture',
        de: 'Profilbild ändern'
      },
      'profile.takePhoto': {
        en: 'Take Photo',
        de: 'Foto aufnehmen'
      },
      'profile.chooseFromGallery': {
        en: 'Choose from Gallery',
        de: 'Aus Galerie auswählen'
      },
      'profile.uploadPhoto': {
        en: 'Upload Photo',
        de: 'Foto hochladen'
      },
      'profile.removePhoto': {
        en: 'Remove Photo',
        de: 'Foto entfernen'
      },
      'profile.cancel': {
        en: 'Cancel',
        de: 'Abbrechen'
      },
      'profile.error.noUser': {
        en: 'No user found. Please log in.',
        de: 'Kein Benutzer gefunden. Bitte melden Sie sich an.'
      },
      'profile.error.cameraPermissionDenied': {
        en: 'Camera permission denied. Please enable camera access in settings.',
        de: 'Kamera-Berechtigung verweigert. Bitte aktivieren Sie den Kamerazugriff in den Einstellungen.'
      },
      'profile.error.galleryPermissionDenied': {
        en: 'Gallery permission denied. Please enable photo access in settings.',
        de: 'Galerie-Berechtigung verweigert. Bitte aktivieren Sie den Foto-Zugriff in den Einstellungen.'
      },
      'profile.error.cameraFailed': {
        en: 'Failed to take photo. Please try again.',
        de: 'Foto aufnehmen fehlgeschlagen. Bitte versuchen Sie es erneut.'
      },
      'profile.error.galleryFailed': {
        en: 'Failed to select photo from gallery. Please try again.',
        de: 'Foto aus Galerie auswählen fehlgeschlagen. Bitte versuchen Sie es erneut.'
      },
      // Admin page translations
      'admin.title': {
        en: 'Admin Dashboard',
        de: 'Admin-Dashboard'
      },
      'admin.accessDenied.title': {
        en: 'Access Denied',
        de: 'Zugriff verweigert'
      },
      'admin.accessDenied.message': {
        en: 'You do not have administrator privileges to access this page.',
        de: 'Sie haben keine Administrator-Berechtigung für diese Seite.'
      },
      'admin.stats.totalActivities': {
        en: 'Total Activities',
        de: 'Aktivitäten gesamt'
      },
      'admin.stats.totalUsers': {
        en: 'Total Users',
        de: 'Benutzer gesamt'
      },
      'admin.stats.totalTrackingTime': {
        en: 'Total Tracking Time',
        de: 'Gesamte Tracking-Zeit'
      },
      'admin.stats.activeTrackings': {
        en: 'Active Trackings',
        de: 'Aktive Trackings'
      },
      'admin.createActivity.title': {
        en: 'Create New Activity',
        de: 'Neue Aktivität erstellen'
      },
      'admin.createActivity.subtitle': {
        en: 'Add a new activity that users can track',
        de: 'Neue Aktivität hinzufügen, die Benutzer verfolgen können'
      },
      'admin.form.title': {
        en: 'Activity Title',
        de: 'Aktivitätstitel'
      },
      'admin.form.titlePlaceholder': {
        en: 'Enter activity title...',
        de: 'Aktivitätstitel eingeben...'
      },
      'admin.form.titleError': {
        en: 'Title must be at least 2 characters long',
        de: 'Titel muss mindestens 2 Zeichen lang sein'
      },
      'admin.form.description': {
        en: 'Description',
        de: 'Beschreibung'
      },
      'admin.form.descriptionPlaceholder': {
        en: 'Enter activity description...',
        de: 'Aktivitätsbeschreibung eingeben...'
      },
      'admin.form.icon': {
        en: 'Icon',
        de: 'Symbol'
      },
      'admin.form.selectIcon': {
        en: 'Select Icon',
        de: 'Symbol auswählen'
      },
      'admin.form.image': {
        en: 'Activity Image',
        de: 'Aktivitätsbild'
      },
      'admin.form.selectImage': {
        en: 'Select Image',
        de: 'Bild auswählen'
      },
      'admin.form.createActivity': {
        en: 'Create Activity',
        de: 'Aktivität erstellen'
      },
      'admin.form.validationError': {
        en: 'Please fix the form errors before submitting',
        de: 'Bitte korrigieren Sie die Formularfehler vor dem Absenden'
      },
      'admin.manageActivities.title': {
        en: 'Manage Activities',
        de: 'Aktivitäten verwalten'
      },
      'admin.manageActivities.subtitle': {
        en: 'View and edit existing activities',
        de: 'Bestehende Aktivitäten anzeigen und bearbeiten'
      },
      'admin.search.placeholder': {
        en: 'Search activities...',
        de: 'Aktivitäten suchen...'
      },
      'admin.status.inactive': {
        en: 'Inactive',
        de: 'Inaktiv'
      },
      'admin.noActivities': {
        en: 'No activities found',
        de: 'Keine Aktivitäten gefunden'
      },
      'admin.iconPicker.title': {
        en: 'Select Icon',
        de: 'Symbol auswählen'
      },
      'admin.success.activityCreated': {
        en: 'Activity created successfully!',
        de: 'Aktivität erfolgreich erstellt!'
      },
      'admin.success.activated': {
        en: 'Activity activated successfully',
        de: 'Aktivität erfolgreich aktiviert'
      },
      'admin.success.deactivated': {
        en: 'Activity deactivated successfully',
        de: 'Aktivität erfolgreich deaktiviert'
      },
      'admin.success.deleted': {
        en: 'Activity deleted successfully',
        de: 'Aktivität erfolgreich gelöscht'
      },
      'admin.error.createFailed': {
        en: 'Failed to create activity. Please try again.',
        de: 'Aktivität konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'
      },
      'admin.error.fileTooLarge': {
        en: 'File size too large. Please select a file smaller than 5MB.',
        de: 'Datei zu groß. Bitte wählen Sie eine Datei kleiner als 5MB.'
      },
      'admin.error.invalidFileType': {
        en: 'Invalid file type. Please select an image file.',
        de: 'Ungültiger Dateityp. Bitte wählen Sie eine Bilddatei.'
      },
      'admin.error.imageSelectionFailed': {
        en: 'Failed to select image. Please try again.',
        de: 'Bild konnte nicht ausgewählt werden. Bitte versuchen Sie es erneut.'
      },
      'admin.error.statusUpdateFailed': {
        en: 'Failed to update activity status. Please try again.',
        de: 'Aktivitätsstatus konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.'
      },
      'admin.error.deleteFailed': {
        en: 'Failed to delete activity. Please try again.',
        de: 'Aktivität konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.'
      },
      'admin.info.editNotImplemented': {
        en: 'Edit functionality will be implemented soon',
        de: 'Bearbeitungsfunktion wird bald implementiert'
      },
      'admin.delete.title': {
        en: 'Delete Activity',
        de: 'Aktivität löschen'
      },
      'admin.delete.message': {
        en: 'Are you sure you want to delete "{title}"? This action cannot be undone.',
        de: 'Sind Sie sicher, dass Sie "{title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.'
      },
      'admin.delete.cancel': {
        en: 'Cancel',
        de: 'Abbrechen'
      },
      'admin.delete.confirm': {
        en: 'Delete',
        de: 'Löschen'
      },
      // Activity service translations
      'activity.error.notFound': {
        en: 'Activity not found',
        de: 'Aktivität nicht gefunden'
      },
      'activity.success.deleted': {
        en: 'Activity deleted successfully',
        de: 'Aktivität erfolgreich gelöscht'
      },
      'activity.error.deleteFailed': {
        en: 'Failed to delete activity: ',
        de: 'Fehler beim Löschen der Aktivität: '
      },
      // My Activities translations
      'myActivities.title': {
        en: 'My Activities',
        de: 'Meine Aktivitäten'
      },
      'myActivities.noActivities': {
        en: 'No activities found. Start tracking to see your activities here.',
        de: 'Keine Aktivitäten gefunden. Beginnen Sie mit der Verfolgung, um Ihre Aktivitäten hier zu sehen.'
      },
      'myActivities.onboarding.title': {
        en: 'Get Started with Activities',
        de: 'Einstieg in Aktivitäten'
      },
      'myActivities.onboarding.description': {
        en: 'Track your activities and stay organized.',
        de: 'Verfolgen Sie Ihre Aktivitäten und bleiben Sie organisiert.'
      }
    };

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
      window.location.reload();
    }
  }
}

// Translation object
const translations: { [key: string]: { [lang: string]: string } } = {
  // App title
  'app.title': {
    en: 'BetterGS',
    de: 'BetterGS'
  },

  // Common UI elements
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
  'common.next': {
    en: 'Next',
    de: 'Weiter'
  },
  'common.loading': {
    en: 'Loading...',
    de: 'Lädt...'
  },
  'common.refresh': {
    en: 'Refresh',
    de: 'Aktualisieren'
  },
  'common.error': {
    en: 'Error',
    de: 'Fehler'
  },
  'common.success': {
    en: 'Success',
    de: 'Erfolg'
  },

  // Onboarding
  'onboarding.title': {
    en: 'Welcome',
    de: 'Willkommen'
  },
  'onboarding.welcome': {
    en: 'Welcome to BetterGS!',
    de: 'Willkommen bei BetterGS!'
  },
  'onboarding.subtitle': {
    en: 'Let\'s get you started with a quick setup',
    de: 'Lass uns mit einer kurzen Einrichtung beginnen'
  },
  'onboarding.complete': {
    en: 'Get Started',
    de: 'Los geht\'s'
  },
  'onboarding.skip': {
    en: 'Skip for now',
    de: 'Überspringen'
  },

  // Onboarding Step 1 - Introduction
  'onboarding.step1.title': {
    en: 'Introduction',
    de: 'Einführung'
  },
  'onboarding.step1.feature1.title': {
    en: 'Track Your Activities',
    de: 'Aktivitäten verfolgen'
  },
  'onboarding.step1.feature1.description': {
    en: 'Keep track of your sustainable activities and monitor your progress over time',
    de: 'Verfolge deine nachhaltigen Aktivitäten und sammle Zeit'
  },
  'onboarding.step1.feature2.title': {
    en: 'Compete with Others',
    de: 'Mit anderen konkurrieren'
  },
  'onboarding.step1.feature2.description': {
    en: 'Compare your achievements with others and climb the leaderboards',
    de: 'Vergleiche deine Werte mit Anderen und klettere in den Ranglisten'
  },
  'onboarding.step1.feature3.title': {
    en: 'Win Prizes after the end of the sustainability challenge',
    de: 'Gewinne Preise nach dem Ende der Nachhaltigkeits-Challenge'
  },
  'onboarding.step1.feature3.description': {
    en: 'all your trackings will be summed up and you can win prizes',
    de: 'Alle deine Aktivitäten werden summiert und du kannst zum Abschluss am 27.09. tolle Preise gewinnen'
  },

  // Onboarding Step 2 - Permissions
  'onboarding.step2.title': {
    en: 'Permissions',
    de: 'Berechtigungen'
  },
  'onboarding.step2.subtitle': {
    en: 'We need some permissions to provide the best experience',
    de: 'Wir benötigen einige Berechtigungen für die beste Erfahrung'
  },
  'onboarding.step2.camera.title': {
    en: 'Camera Access',
    de: 'Kamera-Zugriff'
  },
  'onboarding.step2.camera.description': {
    en: 'Take photos to document your activities and achievements',
    de: 'Mache Fotos um deine Aktivitäten und Erfolge zu dokumentieren'
  },
  'onboarding.step2.camera.button': {
    en: 'Allow Camera',
    de: 'Kamera erlauben'
  },
  'onboarding.step2.photos.title': {
    en: 'Photo Library',
    de: 'Fotobibliothek'
  },
  'onboarding.step2.photos.description': {
    en: 'Select photos from your gallery to enhance your profile',
    de: 'Wähle Fotos aus deiner Galerie um dein Profil zu verbessern'
  },
  'onboarding.step2.photos.button': {
    en: 'Allow Photos',
    de: 'Fotos erlauben'
  },

  // Onboarding Step 3 - Notifications
  'onboarding.step3.title': {
    en: 'Notifications',
    de: 'Benachrichtigungen'
  },
  'onboarding.step3.subtitle': {
    en: 'Stay updated with important information and achievements',
    de: 'Bleibe über wichtige Informationen und Erfolge informiert'
  },
  'onboarding.step3.feature.title': {
    en: 'Get Notified',
    de: 'Benachrichtigt werden'
  },
  'onboarding.step3.feature.description': {
    en: 'Receive timely notifications about your progress, achievements, and important updates.',
    de: 'Erhalte rechtzeitige Benachrichtigungen über deinen Fortschritt, Erfolge und wichtige Updates.'
  },
  'onboarding.step3.benefit1': {
    en: 'Daily activity reminders',
    de: 'Tägliche Aktivitäts-Erinnerungen'
  },
  'onboarding.step3.benefit2': {
    en: 'Achievement celebrations',
    de: 'Erfolgs-Feiern'
  },
  'onboarding.step3.benefit3': {
    en: 'Important app updates',
    de: 'Wichtige App-Updates'
  },
  'onboarding.step3.button': {
    en: 'Enable Notifications',
    de: 'Benachrichtigungen aktivieren'
  },
  'onboarding.step3.webNote': {
    en: 'Notifications are automatically enabled for web browsers',
    de: 'Benachrichtigungen sind für Webbrowser automatisch aktiviert'
  },

  // Onboarding Permissions
  'onboarding.permissions.granted': {
    en: 'Granted',
    de: 'Gewährt'
  },
  'onboarding.permissions.denied': {
    en: 'Permission denied',
    de: 'Berechtigung verweigert'
  },
  'onboarding.permissions.error': {
    en: 'Error requesting permission',
    de: 'Fehler beim Anfordern der Berechtigung'
  },

  // Language selector
  'language.selector': {
    en: 'Language',
    de: 'Sprache'
  },

  // Tab Navigation
  'tabs.activities': {
    en: 'Activities',
    de: 'Aktivitäten'
  },
  'tabs.ranking': {
    en: 'Ranking',
    de: 'Rangliste'
  },
  'tabs.profile': {
    en: 'Profile',
    de: 'Profil'
  },
  'tabs.admin': {
    en: 'Admin',
    de: 'Admin'
  },

  // Login page
  'login.brand.subtitle': {
    en: 'Track your activities and improve your performance',
    de: 'Verfolge deine Aktivitäten und verbessere deine Leistung'
  },
  'login.welcome.title': {
    en: 'Welcome Back',
    de: 'Willkommen zurück'
  },
  'login.welcome.subtitle': {
    en: 'Sign in to your account',
    de: 'Melde dich in deinem Konto an'
  },
  'login.remember.me': {
    en: 'Remember me',
    de: 'Angemeldet bleiben'
  },
  'login.forgot.password': {
    en: 'Forgot Password?',
    de: 'Passwort vergessen?'
  },
  'login.sign.in': {
    en: 'Sign In',
    de: 'Anmelden'
  },
  'login.signing.in': {
    en: 'Signing In...',
    de: 'Anmeldung läuft...'
  },
  'login.continue.guest': {
    en: 'Try Out without Login',
    de: 'Ohne Anmeldung ausprobieren'
  },
  'login.no.account': {
    en: "Don't have an account?",
    de: 'Noch kein Konto?'
  },

  // Signup page
  'signup.title': {
    en: 'Sign Up',
    de: 'Registrieren'
  },
  'signup.brand.title': {
    en: 'Join BetterGS',
    de: 'Bei BetterGS anmelden'
  },
  'signup.brand.subtitle': {
    en: 'Start tracking your activities today',
    de: 'Beginne heute mit dem Verfolgen deiner Aktivitäten'
  },
  'signup.create.account': {
    en: 'Create Account',
    de: 'Konto erstellen'
  },
  'signup.subtitle': {
    en: 'Fill in your details to get started',
    de: 'Fülle deine Details aus, um zu beginnen'
  },
  'signup.display.name': {
    en: 'Display Name',
    de: 'Anzeigename'
  },
  'signup.email': {
    en: 'Email address',
    de: 'E-Mail-Adresse'
  },
  'signup.password': {
    en: 'Password (min. 6 characters)',
    de: 'Passwort (min. 6 Zeichen)'
  },
  'signup.confirm.password': {
    en: 'Confirm Password',
    de: 'Passwort bestätigen'
  },
  'signup.terms.agreement': {
    en: 'I agree to the',
    de: 'Ich stimme den'
  },
  'signup.terms.service': {
    en: 'Terms of Service',
    de: 'Nutzungsbedingungen'
  },
  'signup.privacy.policy': {
    en: 'Privacy Policy',
    de: 'Datenschutzrichtlinien'
  },
  'signup.creating.account': {
    en: 'Creating Account...',
    de: 'Konto wird erstellt...'
  },
  'signup.already.have.account': {
    en: 'Already have an account?',
    de: 'Hast du bereits ein Konto?'
  },

  // Validation messages
  'validation.email.required': {
    en: 'Please enter a valid email address',
    de: 'Bitte gib eine gültige E-Mail-Adresse ein'
  },
  'validation.password.required': {
    en: 'Password is required',
    de: 'Passwort ist erforderlich'
  },
  'validation.password.minlength': {
    en: 'Password must be at least 6 characters long',
    de: 'Passwort muss mindestens 6 Zeichen lang sein'
  },
  'validation.passwords.mismatch': {
    en: 'Passwords do not match',
    de: 'Passwörter stimmen nicht überein'
  },
  'validation.displayname.required': {
    en: 'Display name must be at least 2 characters',
    de: 'Anzeigename muss mindestens 2 Zeichen lang sein'
  },
  'validation.terms.required': {
    en: 'You must agree to the terms to continue',
    de: 'Du musst den Bedingungen zustimmen, um fortzufahren'
  },

  // My Activities page
  'activities.title': {
    en: 'Activities',
    de: 'Aktivitäten'
  },
  'myActivities.title': {
    en: 'My Activities',
    de: 'Meine Aktivitäten'
  },
  'myActivities.onboarding.title': {
    en: 'Track Your Activities',
    de: 'Verfolge deine Aktivitäten'
  },
  'myActivities.onboarding.description': {
    en: 'Start tracking your sustainable activities to monitor your progress and improve your environmental handprint',
    de: 'Beginne damit, deine nachhaltigen Aktivitäten zu verfolgen, um deinen Fortschritt zu überwachen und deinen ökologischen Fußabdruck zu verbessern.'
  },
  'myActivities.noActivities': {
    en: 'No activities found. Start tracking to see your activities here.',
    de: 'Keine Aktivitäten gefunden. Beginne mit der Verfolgung, um deine nachhaltigen Aktivitäten hier zu sehen.'
  },

  // Ranking page
  'ranking.title': {
    en: 'Ranking',
    de: 'Rangliste'
  },
  'ranking.leaderboard': {
    en: 'Leaderboard',
    de: 'Bestenliste'
  },
  'ranking.description': {
    en: 'See how you rank against other users and track your progress.',
    de: 'Sieh, wie du im Vergleich zu anderen Benutzern abschneidest und verfolge deinen Fortschritt.'
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
    en: 'No users available for ranking at the moment.',
    de: 'Derzeit sind keine Benutzer für die Rangliste verfügbar.'
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

  // User status
  'user.status.active': {
    en: 'Active',
    de: 'Aktiv'
  },

  // Profile page translations
  'profile.title': {
    en: 'Profile',
    de: 'Profil'
  },
  'profile.anonymous.user': {
    en: 'Anonymous User',
    de: 'Anonymer Benutzer'
  },
  'profile.not.registered': {
    en: 'Your profile has not been registered yet. Your data is temporary. Enter your email address and password to create a profile',
    de: 'Dein Profil wurde noch nicht registriert. Deine Daten sind temporär. Gib deine E-Mail-Adresse und Passwort ein, um ein Profil zu erstellen'
  },
  'profile.member.since': {
    en: 'Member since',
    de: 'Mitglied seit'
  },
  'profile.account.statistics': {
    en: 'Account Statistics',
    de: 'Kontostatistiken'
  },
  'profile.total.trackings': {
    en: 'Total Trackings',
    de: 'Gesamte Verfolgungen'
  },
  'profile.total.time': {
    en: 'Total Time',
    de: 'Gesamtzeit'
  },
  'profile.activities': {
    en: 'Activities',
    de: 'Aktivitäten'
  },
  'profile.days.active': {
    en: 'Days Active',
    de: 'Aktive Tage'
  },
  'profile.your.information': {
    en: 'Your Information',
    de: 'Deine Informationen'
  },
  'profile.password.security': {
    en: 'Password & Security',
    de: 'Passwort & Sicherheit'
  },
  'profile.password.hint': {
    en: 'Leave empty to keep current password',
    de: 'Leer lassen, um aktuelles Passwort zu behalten'
  },
  'profile.saving': {
    en: 'Saving...',
    de: 'Speichere...'
  },
  'profile.save.changes': {
    en: 'Save Changes',
    de: 'Änderungen speichern'
  },
  'profile.reset.changes': {
    en: 'Reset Changes',
    de: 'Änderungen zurücksetzen'
  },
  'profile.danger.zone': {
    en: 'Danger Zone',
    de: 'Gefahrenbereich'
  },
  'profile.delete.warning': {
    en: 'Deleting your account will permanently remove all your data. This action cannot be undone.',
    de: 'Das Löschen deines Kontos entfernt dauerhaft alle deine Daten. Diese Aktion kann nicht rückgängig gemacht werden.'
  },
  'profile.delete.account': {
    en: 'Delete Account',
    de: 'Konto löschen'
  },

  // Profile picture upload translations
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
  'error.file.upload': {
    en: 'Error uploading file',
    de: 'Fehler beim Hochladen der Datei'
  },
  'error.logout': {
    en: 'Error logging out',
    de: 'Fehler beim Abmelden'
  },
  'error.no.user.to.logout': {
    en: 'No user to logout',
    de: 'Kein Benutzer zum Abmelden'
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

  // Activity service translations
  'activity.success.created': {
    en: 'Activity successfully created',
    de: 'Aktivität erfolgreich erstellt'
  },
  'activity.success.updated': {
    en: 'Activity successfully updated',
    de: 'Aktivität erfolgreich aktualisiert'
  },
  'activity.success.deleted': {
    en: 'Activity deleted successfully',
    de: 'Aktivität erfolgreich gelöscht'
  },
  'activity.error.creationFailed': {
    en: 'Error creating activity: ',
    de: 'Fehler beim Erstellen der Aktivität: '
  },
  'activity.error.updateFailed': {
    en: 'Error updating activity',
    de: 'Fehler beim Aktualisieren der Aktivität'
  },
  'activity.error.deleteFailed': {
    en: 'Failed to delete activity: ',
    de: 'Fehler beim Löschen der Aktivität: '
  },
  'activity.error.notFound': {
    en: 'Activity not found',
    de: 'Aktivität nicht gefunden'
  },

  // Tracking service translations
  'tracking.success.started': {
    en: 'Tracking started successfully',
    de: 'Tracking erfolgreich gestartet'
  },
  'tracking.success.dataSaved': {
    en: 'Tracking data saved successfully',
    de: 'Tracking-Daten erfolgreich gespeichert'
  },
  'tracking.error.userRefRequired': {
    en: 'User reference required',
    de: 'Benutzerreferenz erforderlich'
  },
  'tracking.error.activityRefRequired': {
    en: 'Activity reference required',
    de: 'Aktivitätsreferenz erforderlich'
  },
  'tracking.error.saveFailed': {
    en: 'Failed to save tracking data: ',
    de: 'Fehler beim Speichern der Tracking-Daten: '
  },
  'tracking.error.referencesRequired': {
    en: 'User and activity references are required',
    de: 'Benutzer- und Aktivitätsreferenzen sind erforderlich'
  }
};

export default translations;
export { translations };
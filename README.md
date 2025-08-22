# BetterGS - MachMit!Haus Goslar

[![Angular](https://img.shields.io/badge/Angular-20.0.0-DD0031?style=flat-square&logo=angular)](https://angular.io/)
[![Ionic](https://img.shields.io/badge/Ionic-8.0.0-3880FF?style=flat-square&logo=ionic)](https://ionicframework.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.0-007ACC?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-20.0.1-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.4.1-119EFF?style=flat-square&logo=capacitor)](https://capacitorjs.com/)

> 🌱 **BetterGS - sustain the future**  
> Eine innovative mobile App der Stadt Goslar für nachhaltiges Engagement und Community-Building.

---

## 📱 Über das Projekt

BetterGS ist eine Progressive Web App (PWA) mit nativen mobilen Funktionen, entwickelt für das MachMit!Haus in Goslar. Die App fördert nachhaltiges Verhalten und Community-Engagement durch:

- **🏃‍♀️ Aktivitäts-Tracking**: Verfolge deine nachhaltigen Aktivitäten
- **🏆 Gamification**: Sammle Punkte und erreiche Ziele
- **👥 Community**: Vernetze dich mit anderen umweltbewussten Bürgern
- **📊 Ranglisten**: Vergleiche deine Fortschritte mit anderen
- **🌍 Internationalisierung**: Vollständige Unterstützung für Deutsch und Englisch

## 🏗️ Technische Architektur

### Frontend Stack
- **Angular 20** - Modernes Web-Framework
- **Ionic 8** - Cross-Platform UI Components
- **TypeScript 5.8** - Type-sichere Entwicklung
- **RxJS 7.8** - Reactive Programming
- **SCSS** - Styling mit CSS-Präprozessor

### Backend & Services
- **Firebase** - Backend-as-a-Service
  - Authentication (Benutzeranmeldung)
  - Firestore (NoSQL-Datenbank)
  - Storage (Datei-Upload)
- **Capacitor 7** - Native App-Funktionen
  - Kamera-Integration
  - Local Notifications
  - Platform-spezifische APIs

### Development & Quality
- **ESLint** - Code-Qualität und Stil
- **Jasmine + Karma** - Unit Testing
- **Angular CLI** - Build-System
- **i18n** - Internationalisierung

## 🚀 Quick Start

### Voraussetzungen

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Repository klonen
git clone https://github.com/stadt-goslar/betterGS.git
cd betterGS

# Dependencies installieren
npm install

# Capacitor für mobile Entwicklung vorbereiten
npm run ionic capacitor sync
```

### Entwicklung

```bash
# Development Server starten (Englisch)
npm run start:en

# Development Server starten (Deutsch)
npm run start:de

# Standard Development Server
npm start
```

Die App läuft unter `http://localhost:4200`

### Testing

```bash
# Unit Tests ausführen
npm test

# Tests mit Code Coverage
npm run test:coverage

# Tests im Watch-Mode
npm run test:watch
```

### Build

```bash
# Production Build (alle Sprachen)
npm run build:i18n

# Production Build (nur Deutsch)
npm run build:de

# Production Build (nur Englisch)
npm run build:en
```

## 📁 Projektstruktur

```
betterGS/
├── src/
│   ├── app/
│   │   ├── components/          # Wiederverwendbare Komponenten
│   │   ├── core/               # Core Services & Guards
│   │   ├── singlePages/        # Standalone Seiten
│   │   ├── tabs/               # Tab-Navigation Seiten
│   │   │   ├── my-activities/  # Aktivitäts-Management
│   │   │   ├── profile/        # Benutzer-Profil
│   │   │   └── ranking/        # Ranglisten & Leaderboards
│   │   └── shared/             # Geteilte Utilities
│   ├── assets/                 # Statische Assets
│   ├── environments/           # Umgebungs-Konfigurationen
│   ├── locale/                 # i18n Übersetzungsdateien
│   └── theme/                  # SCSS Theming
├── ios/                        # iOS Capacitor Projekt
├── www/                        # Build Output
└── docs/                       # Dokumentation
```

## 🌍 Internationalisierung (i18n)

Die App unterstützt vollständige Mehrsprachigkeit:

### Unterstützte Sprachen
- 🇺🇸 **Englisch (en)** - Standard/Fallback
- 🇩🇪 **Deutsch (de)** - Deutsche Übersetzung

### i18n Workflow

```bash
# Neue Übersetzungen extrahieren
npm run extract-i18n

# Übersetzungsdateien bearbeiten
# src/locale/messages.de.xlf
# src/locale/messages.en.xlf

# Mit Übersetzungen testen
npm run start:de
npm run start:en
```

Siehe [I18N-README.md](./I18N-README.md) für detaillierte Anleitungen.

## 📱 Mobile Entwicklung

### iOS Setup

```bash
# iOS Projekt erstellen/aktualisieren
npm run ionic capacitor sync ios

# iOS App im Simulator öffnen
npm run ionic capacitor run ios
```

### Android Setup

```bash
# Android Projekt erstellen/aktualisieren
npm run ionic capacitor sync android

# Android App im Emulator öffnen
npm run ionic capacitor run android
```

## 🧪 Testing

Das Projekt verfügt über eine umfassende Test-Suite:

### Test-Infrastruktur
- **Unit Tests**: Jasmine + Karma
- **Component Tests**: Angular Testing Utilities
- **Firebase Mocking**: Vollständige Mock-Implementation
- **Test Coverage**: Umfassende Abdeckung kritischer Pfade

### Test-Statistiken
- ✅ **MyActivitiesPage**: 29/29 Tests
- ✅ **RankingPage**: 53/53 Tests  
- ✅ **ProfilePage**: 49/49 Tests
- ✅ **Gesamt**: 101/101 Tests bestehen

### Test Commands

```bash
# Alle Tests ausführen
npm test

# Spezifische Komponente testen
npm test -- --include='**/profile.page.spec.ts'

# Tests mit Watch-Mode
npm test -- --watch

# Headless Testing (CI)
npm test -- --browsers=ChromeHeadless --watch=false
```

## 🔧 Development Guidelines

### Code-Qualität

```bash
# Linting ausführen
npm run lint

# Auto-Fix für Linting-Fehler
npm run lint:fix
```

### Git Workflow

1. **Feature Branch** erstellen: `git checkout -b feature/neue-funktion`
2. **Changes committen**: `git commit -m "feat: neue Funktion hinzugefügt"`
3. **Pull Request** erstellen gegen `main` Branch
4. **CI/CD Pipeline** muss erfolgreich durchlaufen
5. **Code Review** und **Merge**

### Commit Convention

```
feat: neue Funktion
fix: Bugfix
docs: Dokumentation
style: Formatierung
refactor: Code-Refactoring
test: Tests hinzufügen/ändern
chore: Build-Prozess/Dependencies
```

## 🚀 Deployment

### Staging Environment

```bash
# Build für Staging
npm run build:i18n

# Deploy zu Firebase Hosting (Staging)
firebase deploy --only hosting:staging
```

### Production Environment

```bash
# Production Build
npm run build:i18n

# Deploy zu Firebase Hosting (Production)
firebase deploy --only hosting:production
```

### Mobile App Stores

```bash
# iOS Build für App Store
npm run build:i18n
npm run ionic capacitor sync ios
# Xcode öffnen und Archive erstellen

# Android Build für Play Store
npm run build:i18n
npm run ionic capacitor sync android
# Android Studio öffnen und Bundle erstellen
```

## 🤝 Contributing

### Entwicklungsumgebung Setup

1. Repository forken und klonen
2. `npm install` ausführen
3. Feature Branch erstellen
4. Änderungen implementieren
5. Tests schreiben/aktualisieren
6. Pull Request erstellen

### Pull Request Guidelines

- ✅ Alle Tests müssen bestehen
- ✅ Code-Qualität (ESLint) erfüllt
- ✅ Dokumentation aktualisiert
- ✅ i18n Übersetzungen vollständig
- ✅ Mobile Kompatibilität getestet

## 📊 Performance & Monitoring

### Web Vitals
- **Lighthouse Score**: > 90
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Bundle Size
- **Main Bundle**: < 500KB (gzipped)
- **Lazy Loaded Chunks**: < 50KB each
- **Tree Shaking**: Aktiviert für optimale Bundle-Größe

## 🔒 Security

### Sicherheitsmaßnahmen
- **Firebase Security Rules**: Strenge Datenzugriffs-Kontrolle
- **Authentication**: Sichere Benutzer-Anmeldung
- **HTTPS**: Verschlüsselte Datenübertragung
- **Content Security Policy**: XSS-Schutz
- **Dependency Scanning**: Regelmäßige Sicherheitsupdates

## 📞 Support & Contact

### Entwicklung
- **Repository**: [GitHub - BetterGS](https://github.com/stadt-goslar/betterGS)
- **Issues**: [GitHub Issues](https://github.com/stadt-goslar/betterGS/issues)
- **Wiki**: [Projekt-Wiki](https://github.com/stadt-goslar/betterGS/wiki)

### Stadt Goslar
- **MachMit!Haus**: [machmit.goslar.de](https://machmit.goslar.de)
- **E-Mail**: machmit@goslar.de
- **Telefon**: +49 5321 704 - 525

## 📄 Lizenz

Dieses Projekt steht unter der [MIT Lizenz](./LICENSE).

---

## 🙏 Danksagungen

- **Stadt Goslar** - Projektträger und Vision
- **MachMit!Haus Team** - Fachliche Beratung und Testing
- **Angular & Ionic Teams** - Exzellente Frameworks
- **Open Source Community** - Inspiration und Tools

---

> 💚 **Gemeinsam für eine nachhaltige Zukunft in Goslar!**

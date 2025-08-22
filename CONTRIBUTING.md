# 🤝 Contributing to BetterGS

Vielen Dank für dein Interesse, zu BetterGS beizutragen! Diese Datei enthält Richtlinien und Informationen für Entwickler, die am Projekt mitwirken möchten.

## 📋 Inhaltsverzeichnis

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## 📜 Code of Conduct

Dieses Projekt folgt dem [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Durch die Teilnahme erwarten wir, dass du diesen Code einhältst.

## 🚀 Getting Started

### Voraussetzungen

```bash
node >= 18.0.0
npm >= 9.0.0
git >= 2.40.0
```

### Repository Setup

1. **Fork das Repository**
   ```bash
   # Klone dein Fork
   git clone https://github.com/DEIN-USERNAME/betterGS.git
   cd betterGS
   ```

2. **Remote Upstream hinzufügen**
   ```bash
   git remote add upstream https://github.com/stadt-goslar/betterGS.git
   ```

3. **Dependencies installieren**
   ```bash
   npm install
   ```

4. **Development Server starten**
   ```bash
   npm run start:de  # oder start:en
   ```

### Projekt-Struktur verstehen

```
src/
├── app/
│   ├── components/          # Wiederverwendbare UI-Komponenten
│   ├── core/               # Core Services, Guards, Interceptors
│   ├── shared/             # Geteilte Utilities, Pipes, Directives
│   ├── singlePages/        # Standalone Seiten
│   └── tabs/               # Tab-Navigation Seiten
├── assets/                 # Statische Assets (Bilder, Icons)
├── environments/           # Umgebungs-Konfigurationen
├── locale/                 # i18n Übersetzungsdateien
└── theme/                  # SCSS Theming und Variablen
```

## 🔄 Development Process

### Branch Strategy

- **`main`** - Production-ready Code
- **`develop`** - Integration Branch für neue Features
- **`feature/`** - Feature Branches (z.B. `feature/user-profile`)
- **`fix/`** - Bug Fix Branches (z.B. `fix/login-issue`)
- **`chore/`** - Maintenance Branches (z.B. `chore/update-dependencies`)

### Workflow

1. **Branch erstellen**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/deine-neue-funktion
   ```

2. **Entwickeln & Testen**
   ```bash
   # Entwicklung
   npm run start:de
   
   # Tests ausführen
   npm run test:watch
   
   # Linting
   npm run lint:fix
   ```

3. **Committen**
   ```bash
   git add .
   git commit -m "feat: neue Funktion hinzugefügt"
   ```

4. **Push & Pull Request**
   ```bash
   git push origin feature/deine-neue-funktion
   # Erstelle PR auf GitHub
   ```

### Commit Convention

Wir folgen der [Conventional Commits](https://www.conventionalcommits.org/) Spezifikation:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types:
- `feat` - Neue Funktion
- `fix` - Bug Fix
- `docs` - Dokumentation
- `style` - Code-Formatierung
- `refactor` - Code-Refactoring
- `test` - Tests hinzufügen/ändern
- `chore` - Build-Prozess, Dependencies

#### Beispiele:
```bash
feat(profile): Benutzer-Avatar Upload hinzugefügt
fix(auth): Login-Fehler bei ungültigen Credentials behoben
docs(readme): Installation-Anleitung aktualisiert
test(profile): Unit Tests für Profilkomponente hinzugefügt
```

## 📏 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Gut: Explizite Typisierung
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ✅ Gut: Readonly für Immutability
const CONFIG: Readonly<Config> = {
  apiUrl: 'https://api.example.com'
};

// ✅ Gut: Async/Await statt Promises
async loadUserProfile(id: string): Promise<UserProfile> {
  try {
    const response = await this.http.get<UserProfile>(`/users/${id}`);
    return response;
  } catch (error) {
    this.handleError(error);
    throw error;
  }
}
```

### Angular Guidelines

```typescript
// ✅ Gut: OnPush Change Detection
@Component({
  selector: 'app-user-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})

// ✅ Gut: Unsubscribe Pattern
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.userService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.user = user);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### SCSS Guidelines

```scss
// ✅ Gut: BEM Methodology
.user-profile {
  &__avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    
    &--large {
      width: 128px;
      height: 128px;
    }
  }
  
  &__name {
    font-weight: 600;
    color: var(--ion-color-primary);
  }
}

// ✅ Gut: CSS Custom Properties verwenden
.theme-dark {
  --background-color: #1a1a1a;
  --text-color: #ffffff;
}
```

### ESLint Configuration

Unser ESLint Setup enforced:
- **TypeScript Strict Mode**
- **Angular Style Guide**
- **Accessibility Rules**
- **Import/Export Order**
- **No Console.log in Production**

## 🧪 Testing Guidelines

### Unit Tests

```typescript
describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should load user profile on init', () => {
    const mockUser = { id: '1', name: 'Test User' };
    userService.getCurrentUser.and.returnValue(of(mockUser));

    component.ngOnInit();

    expect(component.user).toEqual(mockUser);
  });
});
```

### Test Requirements

- **Component Tests**: Alle öffentlichen Methoden
- **Service Tests**: Business Logic und API Calls
- **Integration Tests**: Wichtige User Flows
- **E2E Tests**: Kritische Pfade (Login, Hauptfunktionen)

### Test Commands

```bash
# Einzelne Tests ausführen
npm test -- --include='**/profile.component.spec.ts'

# Coverage Report generieren
npm run test:coverage

# CI Tests (headless)
npm run test:ci
```

## 🌍 Internationalisierung (i18n)

### Neue Übersetzungen hinzufügen

1. **i18n Marker im Code**
   ```typescript
   // Template
   <p i18n="@@profile.welcome">Welcome to your profile!</p>
   
   // TypeScript
   this.message = $localize`:@@profile.error:An error occurred`;
   ```

2. **Übersetzungen extrahieren**
   ```bash
   npm run extract-i18n
   ```

3. **Übersetzungsdateien bearbeiten**
   - `src/locale/messages.de.xlf` - Deutsche Übersetzungen
   - `src/locale/messages.en.xlf` - Englische Übersetzungen

4. **Testen**
   ```bash
   npm run start:de  # Deutsche Version
   npm run start:en  # Englische Version
   ```

## 🔄 Pull Request Process

### Vor dem PR

```bash
# Code Quality Checks
npm run pre-commit

# Build Tests
npm run pre-push
```

### PR Requirements

- ✅ **Alle Tests bestehen**
- ✅ **ESLint ohne Fehler**
- ✅ **i18n vollständig**
- ✅ **Mobile getestet**
- ✅ **Dokumentation aktualisiert**
- ✅ **Breaking Changes dokumentiert**

### PR Template

Verwende das automatische [PR Template](.github/pull_request_template.md) und fülle alle relevanten Abschnitte aus.

### Review Process

1. **Automated Checks** - CI Pipeline muss erfolgreich sein
2. **Code Review** - Mindestens 1 Reviewer Approval
3. **Manual Testing** - Funktionalität auf verschiedenen Geräten
4. **Accessibility Check** - Barrierefreiheit überprüfen
5. **Performance Check** - Bundle Size und Lighthouse Score

## 📝 Issue Guidelines

### Bug Reports

Verwende das [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md):

- Detaillierte Reproduktionsschritte
- Screenshots/Videos
- Browser/Device Informationen
- Console Errors

### Feature Requests

Verwende das [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md):

- Use Case beschreiben
- Mockups/Wireframes
- Technische Überlegungen
- Akzeptanzkriterien

### Issue Labels

- `bug` - Fehlerhaftes Verhalten
- `enhancement` - Neue Funktion
- `documentation` - Dokumentation
- `help-wanted` - Community Hilfe erwünscht
- `good-first-issue` - Gut für Einsteiger
- `priority:high` - Hohe Priorität
- `mobile` - Mobile-spezifisch
- `i18n` - Internationalisierung

## 🛠️ Development Tools

### Empfohlene VS Code Extensions

```json
{
  "recommendations": [
    "angular.ng-template",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ionic.ionic",
    "ms-vscode.vscode-json"
  ]
}
```

### Browser DevTools

- **Angular DevTools** - Component Inspector
- **Redux DevTools** - State Management (falls verwendet)
- **Lighthouse** - Performance Audits
- **Accessibility Insights** - a11y Testing

## 🔧 Common Development Tasks

### Neue Komponente erstellen

```bash
# Ionic Component mit Standalone
ng generate component components/user-card --standalone

# Mit Tests und SCSS
ng generate component components/user-card --style=scss --spec
```

### Neue Service erstellen

```bash
ng generate service core/services/notification
```

### Neue Page erstellen

```bash
# Ionic Page
ionic generate page tabs/settings
```

### Dependencies aktualisieren

```bash
# Check für Updates
npm outdated

# Update mit Vorsicht
npm update

# Angular spezifisch
ng update @angular/core @angular/cli
```

## 📊 Performance Guidelines

### Bundle Size

- **Main Bundle**: < 500KB (gzipped)
- **Lazy Chunks**: < 50KB each
- **Assets**: Komprimiert und optimiert

### Code Splitting

```typescript
// Lazy Loading Routes
const routes: Routes = [
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage)
  }
];
```

### Performance Monitoring

```bash
# Bundle Analyse
npm run bundle:analyze

# Lighthouse Audit
npm run lighthouse

# Performance Testing
npm run test:performance
```

## 🔐 Security Guidelines

### Best Practices

- **Keine Secrets im Code** - Verwende Environment Variables
- **Input Validation** - Alle User Inputs validieren
- **Firebase Rules** - Strenge Security Rules
- **HTTPS Only** - Alle API Calls verschlüsselt
- **Content Security Policy** - XSS Schutz

### Security Audit

```bash
# Dependency Security Check
npm run audit:security

# OWASP Dependency Check (in CI)
npm run security:scan
```

## 🆘 Getting Help

### Community Support

- **GitHub Discussions** - Allgemeine Fragen
- **GitHub Issues** - Bug Reports und Feature Requests
- **Stack Overflow** - Tag: `bettergs`

### Documentation

- **Wiki** - [Projekt Wiki](https://github.com/stadt-goslar/betterGS/wiki)
- **API Docs** - Automatisch generiert
- **Style Guide** - Design System Dokumentation

### Contact

- **Lead Developer**: @github-username
- **Product Owner**: @github-username
- **Stadt Goslar**: info@machmit.goslar.de

## 📋 Release Process

### Version Management

Wir verwenden [Semantic Versioning](https://semver.org/):

- **MAJOR** - Breaking Changes
- **MINOR** - Neue Features (backwards compatible)
- **PATCH** - Bug Fixes

### Release Workflow

```bash
# Vorbereitung
npm run pre-push

# Version Bump und Changelog
npm run release

# Git Push mit Tags
git push --follow-tags origin main

# Deploy
npm run deploy:production
```

---

## 🙏 Danke!

Vielen Dank für deinen Beitrag zu BetterGS! Gemeinsam machen wir Goslar nachhaltiger und digitaler. 🌱

Wenn du Fragen hast, zögere nicht, ein Issue zu erstellen oder uns direkt zu kontaktieren.

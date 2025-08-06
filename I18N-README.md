# I18n (Internationalization) Setup für BetterGS

Diese App unterstützt Mehrsprachigkeit mit Deutsch und Englisch.

## 🌍 Unterstützte Sprachen

- **Englisch (en)** - Standard/Fallback-Sprache
- **Deutsch (de)** - Deutsche Übersetzung

## 🚀 Entwicklung

### Lokale Entwicklung mit I18n

```bash
# Englische Version starten
npm run start:en

# Deutsche Version starten  
npm run start:de

# Standard-Entwicklungsserver (Englisch)
npm start
```

### Übersetzungen extrahieren

```bash
# Extrahiert alle i18n-Texte aus den Templates
npm run extract-i18n
```

### Production Build mit I18n

```bash
# Beide Sprachen bauen
npm run build:i18n

# Nur Englisch bauen
npm run build:en

# Nur Deutsch bauen
npm run build:de
```

## 📝 Verwendung in Templates

### Text-Übersetzungen

```html
<!-- Mit i18n-Attribut -->
<h1 i18n="@@page.title">Welcome</h1>

<!-- Mit i18n und Beschreibung -->
<p i18n="@@user.greeting|Greeting message">Hello {{name}}!</p>

<!-- Für Attribute -->
<input placeholder="Enter name" i18n-placeholder="@@input.name.placeholder">
```

### Pipe für dynamische Texte

```html
<!-- Mit benutzerdefinierter Pipe (falls implementiert) -->
<span>{{ 'common.save' | i18n }}</span>
```

## 🔧 I18n-Service Verwendung

```typescript
import { I18nService } from 'src/app/core/services/i18n.service';

constructor(private i18nService: I18nService) {}

// Aktuelle Sprache abrufen
getCurrentLanguage() {
  return this.i18nService.getCurrentLanguage();
}

// Sprache ändern
changeLanguage(lang: 'en' | 'de') {
  this.i18nService.setLanguage(lang);
}

// Übersetzung abrufen (Fallback-Methode)
getTranslation(key: string) {
  return this.i18nService.getTranslation(key);
}
```

## 🎨 Language Selector Komponente

```html
<!-- Überall einfügen wo Sprachwechsel möglich sein soll -->
<app-language-selector></app-language-selector>
```

## 📂 Datei-Struktur

```
src/
├── locale/
│   ├── messages.de.xlf    # Deutsche Übersetzungen
│   └── messages.en.xlf    # Englische Übersetzungen
├── app/
│   ├── core/services/
│   │   └── i18n.service.ts           # I18n-Service
│   └── components/
│       └── language-selector/        # Sprachwechsel-Komponente
└── ...
```

## 🔄 Workflow für neue Übersetzungen

1. **Text in Template hinzufügen:**
   ```html
   <p i18n="@@new.text.key">New text to translate</p>
   ```

2. **Übersetzungen extrahieren:**
   ```bash
   npm run extract-i18n
   ```

3. **Übersetzungsdateien aktualisieren:**
   - `src/locale/messages.de.xlf` bearbeiten
   - Deutsche Übersetzung in `<target>` einfügen

4. **Testen:**
   ```bash
   npm run start:de
   ```

## 🌐 Browser-Sprache

Die App erkennt automatisch die Browser-Sprache und wählt die entsprechende Übersetzung, falls verfügbar.

## 📱 Mobile Considerations

- Language Selector zeigt auf mobilen Geräten nur das Icon
- Responsive Design berücksichtigt unterschiedlich lange Texte
- RTL-Sprachen werden derzeit nicht unterstützt

## 🔍 Debugging

1. **Fehlende Übersetzungen:** Texte erscheinen als Platzhalter-IDs
2. **Konsole checken:** I18n-Warnungen werden in der Entwicklerkonsole angezeigt
3. **XLIFF-Validierung:** Übersetzungsdateien müssen valides XML sein

## 🚀 Deployment

Für Production-Deployment:

```bash
# I18n-Builds erstellen
npm run build:i18n

# Server-Konfiguration für Subpfade:
# - /en/ -> www/en/
# - /de/ -> www/de/
# - / -> www/en/ (Fallback)
```

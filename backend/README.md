# BetterGS Backend

Node.js Backend mit Firebase Admin SDK für die Verwaltung von User Claims und Activities.

## Features

### 🔐 User Management
- Anzeige aller registrierten Benutzer
- Änderung von Custom Claims (User/Admin Rollen)
- Benutzer-Status und Verifizierung anzeigen
- Letzte Anmeldung verfolgen

### 🏃‍♂️ Activity Management
- Neue Activities erstellen
- Bestehende Activities bearbeiten
- Activities löschen
- Icon und Bild-URLs verwalten
- Activity-Status (aktiv/inaktiv) ändern

## Setup

### 1. Dependencies installieren
```bash
cd backend
npm install
```

### 2. Firebase Service Account einrichten

1. Gehe zur [Firebase Console](https://console.firebase.google.com/)
2. Wähle dein Projekt aus
3. Gehe zu "Project Settings" → "Service Accounts"
4. Klicke auf "Generate new private key"
5. Speichere die JSON-Datei als `config/firebase-service-account.json`

### 3. Firebase Konfiguration anpassen

Bearbeite `server.js` und ersetze die folgenden Werte:
```javascript
// Zeile 16: Ersetze mit deiner Firebase Database URL
databaseURL: "https://your-project-id.firebaseio.com"
```

### 4. Server starten

#### Entwicklung:
```bash
npm run dev
```

#### Produktion:
```bash
npm start
```

Der Server läuft standardmäßig auf Port 3000: http://localhost:3000

## API Endpoints

### User Management
- `GET /api/users` - Alle Benutzer abrufen
- `POST /api/users/:uid/role` - Benutzer-Rolle ändern

### Activity Management
- `GET /api/activities` - Alle Activities abrufen
- `POST /api/activities` - Neue Activity erstellen
- `PUT /api/activities/:id` - Activity bearbeiten
- `DELETE /api/activities/:id` - Activity löschen

### Health Check
- `GET /api/health` - Server-Status prüfen

## Sicherheit

⚠️ **Wichtig**: Dieses Backend sollte nur in einer sicheren, internen Umgebung verwendet werden, da es administrative Firebase-Funktionen bereitstellt.

### Empfohlene Sicherheitsmaßnahmen:
1. VPN oder IP-Whitelist verwenden
2. HTTPS in Produktion aktivieren
3. Authentifizierung für Admin-Panel hinzufügen
4. Firebase Security Rules entsprechend konfigurieren

## Dateien

```
backend/
├── package.json              # Node.js Abhängigkeiten
├── server.js                 # Express Server
├── config/
│   └── firebase-service-account.json.example
└── public/
    ├── index.html            # Admin Panel UI
    ├── styles.css            # BetterGS Theme Styles
    └── script.js             # Frontend JavaScript
```

## Design

Das Admin Panel verwendet das gleiche Farbschema und Design wie die BetterGS App:
- Primary Color: #866811 (Gold)
- Secondary Color: #fcce4c (Gelb)
- Success Color: #2e6305 (Grün)
- Bootstrap 5 Components
- Responsive Design
- FontAwesome Icons

## Troubleshooting

### "Permission denied" Fehler
- Überprüfe ob die Firebase Service Account Datei korrekt ist
- Stelle sicher, dass der Service Account die nötigen Rechte hat

### "Cannot connect to Firestore"
- Überprüfe die databaseURL in server.js
- Stelle sicher, dass Firestore für dein Projekt aktiviert ist

### Port bereits in Verwendung
```bash
# Anderen Port verwenden
PORT=3001 npm start
```

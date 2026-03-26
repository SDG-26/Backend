## 1. Project Setup

- [x] 1.1 `package.json` initialisieren und Abhängigkeiten (express@5, typescript ecc.) installieren
- [x] 1.2 TypeScript Konfiguration (`tsconfig.json`) erstellen
- [x] 1.3 Projektverzeichnisstruktur anlegen (src/controllers, src/models, src/middleware, src/routes, src/utils)
- [x] 1.4 Vitest und Supertest Setup für Integrationstests

## 2. Infrastructure & Middleware

- [x] 2.1 Mongoose Connection Singleton implementieren
- [x] 2.2 Globales Error-Handling Middleware erstellen
- [x] 2.3 Zod-Validierungs-Middleware implementieren
- [x] 2.4 Auth-Middleware für JWT-Verifizierung und Rollenprüfung

## 3. Author Capability

- [x] 3.1 Author Mongoose Schema und Model erstellen
- [x] 3.2 Author Zod-Validierungsschemen definieren
- [x] 3.3 Author Controller (CRUD) implementieren
- [x] 3.4 Author Routes registrieren
- [x] 3.5 Integrationstests für Author-Endpoints schreiben

## 4. Book Capability

- [x] 4.1 Book Mongoose Schema und Model (mit Author-Referenz) erstellen
- [x] 4.2 Book Zod-Validierungsschemen definieren
- [x] 4.3 Book Controller (CRUD) implementieren
- [x] 4.4 Pagination und Such-Logik im Book Controller hinzufügen
- [x] 4.5 Book Routes registrieren
- [x] 4.6 Integrationstests für Book-Endpoints schreiben

## 5. Auth Capability

- [x] 5.1 User Schema und Model für Auth (mit Rollen) erstellen
- [x] 5.2 Login Controller mit JWT-Generierung und Cookie-Setting
- [x] 5.3 Auth Routes registrieren
- [x] 5.4 Integrationstests für Auth-Endpoints schreiben

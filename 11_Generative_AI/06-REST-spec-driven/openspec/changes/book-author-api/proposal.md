## Why

Es besteht der Bedarf an einer robusten, typisierten REST API zur Verwaltung von Büchern und Autoren. Diese API soll moderne Standards für Validierung, Authentifizierung und Tests erfüllen, um eine skalierbare Grundlage für zukünftige Entwicklungen zu bieten.

## What Changes

- Implementierung eines Express-Servers mit TypeScript.
- Verwendung der aktuellsten Versionen der Bibliotheken, z.B. Express v5 und TypeScript v6
- CRUD-Endpunkte für die Ressourcen `books` und `authors`.
- Datenbank-Integration mit MongoDB und Mongoose.
- Authentifizierung via JWT in sicheren Cookies.
- Request-Validierung mit Zod.
- Integrationstests mit Vitest und Supertest.
- Unterstützung von Pagination und Suche für Bücher.

## Capabilities

### New Capabilities
- `auth`: JWT-basierte Authentifizierung mit sicheren Cookies.
- `author-management`: CRUD Operationen für Autoren-Ressourcen.
- `book-management`: CRUD Operationen für Bücher-Ressourcen inklusive Suche und Pagination.

### Modified Capabilities
<!-- Keine bestehenden Capabilities vorhanden -->

## Impact

- Neues Backend-Projektverzeichnis mit TypeScript-Konfiguration.
- API-Endpunkte unter `/api/v1`.
- MongoDB Atlas oder lokale Instanz als Datenspeicher.
- Abhängigkeiten: express, mongoose, jsonwebtoken, zod, cookie-parser, vitest, supertest.

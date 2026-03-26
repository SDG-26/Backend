## Context

Das Projekt ist eine Greenfield-Entwicklung einer REST-API für eine Buch- und Autorenverwaltung. Es gibt keine bestehende Codebasis. Fokus liegt auf Typsicherheit, Validierung und Testbarkeit unter Verwendung moderner Tools wie TypeScript 6, Express 5, Mongoose und Zod.

## Goals / Non-Goals

**Goals:**
- Implementierung einer robusten CRUD-API für `books` und `authors`.
- Sicherstellung der Datenintegrität durch Zod-Schema-Validierung.
- Implementierung einer sicheren JWT-Authentifizierung in HTTP-only Cookies.
- Implementierung einer einfachen rollenbasierten Autorisierung (Admin, User).
- 100% Testabdeckung der API-Endpunkte durch Integrationstests.
- Effizientes Daten-Retrieval durch Pagination und Suche.

**Non-Goals:**
- Frontend-Implementierung.
- Deployment-Konfiguration (CI/CD, Docker).
- Komplexe RBAC-Modelle über einfache Rollen hinaus.

## Decisions

- **Express 5**: Verwendung der neuesten (Beta/RC) Features von Express für besseres Promise-Handling und Geschwindigkeit.
- **TypeScript 6**: Nutzung neuester Sprachentwicklungen für maximale Typsicherheit.
- **MongoDB + Mongoose**: Gewählt wegen der Flexibilität für Dokumente und der starken Community-Unterstützung für Node.js.
- **JWT in Cookies**: Höhere Sicherheit gegen XSS im Vergleich zu LocalStorage. `httpOnly: true` und `secure: true` (in Production) sind Pflicht.
- **Rollenbasierte Autorisierung**: Einführung einer `RoleMiddleware`, die Zugriff auf bestimmte Endpunkte (z.B. DELETE Buch) auf Admins beschränkt.
- **Zod**: Bevorzugt gegenüber Joi/Yup wegen der exzellenten TypeScript-Inferenz.
- **Vitest + Supertest**: Vitest ist schneller als Jest und bietet native ESM-Unterstützung, was gut zu modernem TypeScript passt.

## Risks / Trade-offs

- **[Risiko] Express 5 Stabilität**: Da Express 5 noch recht neu ist, könnten unentdeckte Bugs auftreten. → **Mitigation**: Fokus auf Standard-Features und gute Testabdeckung.
- **[Risiko] MongoDB Connection**: Verbindungsabbrüche könnten die API blockieren. → **Mitigation**: Implementierung eines robusten Singleton-Mongoose-Connectors mit Error-Handling.
- **[Trade-off] JWT vs Sessions**: JWTs sind zustandslos, was Skalierung vereinfacht, aber Revocation (Blacklisting) erschwert. → **Mitigation**: Kurze Ablaufzeit der Access Tokens.

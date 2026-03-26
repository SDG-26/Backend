## ADDED Requirements

### Requirement: User Authentication
Das System MUSS eine JWT-basierte Authentifizierung unterstützen. Das Token MUSS in einem sicheren (Secure), nur für den Server zugänglichen (HttpOnly) Cookie gespeichert werden.

#### Scenario: Successful Login
- **WHEN** der Benutzer gültige Anmeldedaten an `/api/v1/auth/login` sendet.
- **THEN** generiert das System ein JWT und setzt einen `access_token` Cookie.

#### Scenario: Unauthorized Access
- **WHEN** ein nicht authentifizierter Benutzer auf eine geschützte Route zugreift.
- **THEN** antwortet das System mit einem 401 Unauthorized Fehler.

### Requirement: Role-Based Access Control (RBAC)
Das System MUSS zwischen verschiedenen Rollen (z.B. User, Admin) unterscheiden. Bestimmte schreibende oder löschende Operationen MÜSSEN auf Admins beschränkt sein.

#### Scenario: Admin Deletes Resource
- **WHEN** ein authentifizierter Admin eine DELETE-Anfrage an `/api/v1/books/:id` sendet.
- **THEN** wird die Ressource erfolgreich gelöscht.

#### Scenario: User Forbidden to Delete
- **WHEN** ein authentifizierter normaler User eine DELETE-Anfrage an `/api/v1/books/:id` sendet.
- **THEN** antwortet das System mit einem 403 Forbidden Fehler.

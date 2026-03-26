## ADDED Requirements

### Requirement: CRUD for Authors
Das System MUSS Endpunkte bereitstellen, um Autoren zu erstellen, zu lesen, zu aktualisieren und zu löschen (CRUD).

#### Scenario: Create an Author
- **WHEN** eine POST-Anfrage an `/api/v1/authors` mit gültigem Namen gesendet wird.
- **THEN** wird der Autor in der Datenbank gespeichert und ein 201 Created zurückgegeben.

#### Scenario: Get All Authors
- **WHEN** eine GET-Anfrage an `/api/v1/authors` gesendet wird.
- **THEN** wird eine Liste aller Autoren zurückgegeben.

### Requirement: Author Validation
Alle Eingangsdaten für Autoren MÜSSEN gegen ein vordefiniertes Schema validiert werden.

#### Scenario: Invalid Author Name
- **WHEN** eine POST-Anfrage mit einem zu kurzen Namen gesendet wird.
- **THEN** antwortet das System mit einem 400 Bad Request Fehler.

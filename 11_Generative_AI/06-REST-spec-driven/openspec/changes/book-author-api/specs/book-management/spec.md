## ADDED Requirements

### Requirement: CRUD for Books
Das System MUSS Endpunkte bereitstellen, um Bücher zu erstellen, zu lesen, zu aktualisieren und zu löschen (CRUD). Jedes Buch MUSS genau einem Autor zugeordnet sein.

#### Scenario: Create a Book
- **WHEN** eine POST-Anfrage an `/api/v1/books` mit gültigen Daten (Titel, Autor-ID) gesendet wird.
- **THEN** wird das Buch gespeichert und mit dem Autor verknüpft.

### Requirement: Search and Pagination
Das System MUSS das Listing von Büchern mit Unterstützung für Pagination (Seite, Limit) und Suche nach dem Titel ermöglichen.

#### Scenario: Paginated Book List
- **WHEN** eine GET-Anfrage an `/api/v1/books?page=2&limit=5` gesendet wird.
- **THEN** werden nur die angeforderten 5 Bücher der zweiten Seite zurückgegeben.

#### Scenario: Search for Book Title
- **WHEN** eine GET-Anfrage an `/api/v1/books?search=Harry` gesendet wird.
- **THEN** werden nur Bücher zurückgegeben, deren Titel "Harry" enthält.

### Requirement: Book Validation
Alle Eingangsdaten für Bücher MÜSSEN gegen ein vordefiniertes Schema validiert werden.

#### Scenario: Missing Author ID
- **WHEN** eine POST-Anfrage für ein Buch ohne `authorId` gesendet wird.
- **THEN** antwortet das System mit einem 400 Bad Request Fehler.

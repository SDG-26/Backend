import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

// StdioServerTransport ermöglicht die Kommunikation über Standard-Input/Output —
// das ist der typische Transportweg, wenn ein MCP-Server von VSCode oder Anwednungen wie Claude Desktop gestartet wird.
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import z from 'zod';

// Neue MCP-Server-Instanz mit einen Namen und Version.
// Diese Metadaten werden beim Handshake mit dem verbundenen Client übermittelt.
const server = new McpServer({
  name: 'MCP Test Server',
  version: '1.0.0',
});

// --- TOOLS ---
// Ein Tool ist eine Funktion, die ein KI-Modell (oder ein Client) aktiv aufrufen kann.
// registerTool() nimmt drei Argumente: einen eindeutigen Namen, Metadaten/Schema und den Handler.

server.registerTool(
  'add',
  {
    title: 'Addition Tool',
    description: 'Add two numbers',
    // Das inputSchema definiert, welche Parameter das Tool erwartet und von welchem Typ sie sind.
    // Zod prüft die Eingaben automatisch — bei falschen Typen schlägt der Aufruf fehl.
    inputSchema: { a: z.number(), b: z.number() },
  },
  async ({ a, b }) => {
    // Unsere Logik
    const sum = a + b;

    // Jedes Tool gibt ein content-Array zurück. Jedes Element hat einen type (hier: 'text')
    // und die eigentlichen Daten. Das ist das standardisierte Antwortformat im MCP-Protokoll.
    return { content: [{ type: 'text', text: JSON.stringify(sum) }] };
  },
);

server.registerTool(
  'greet',
  {
    title: 'Greeting Tool',
    description: 'Greet a user',
    // z.string().optional() bedeutet: der Parameter 'name' ist ein String, aber nicht Pflicht.
    // Fehlt er im Aufruf, ist der Wert undefined.
    inputSchema: { name: z.string().optional() },
  },
  async ({ name }) => {
    return { content: [{ type: 'text', text: `Hello, ${name || 'World'}!` }] };
  },
);

server.registerTool(
  'search_artworks',
  {
    title: 'Search Artworks',
    description: 'Retrieve artworks based on a search query and a page number for pagination.',
    inputSchema: {
      // .describe() fügt dem Schema eine Beschreibung hinzu, die das Modell als Hinweis nutzen kann.
      query: z.string().describe('Search query for artworks'),
      // .int().min(1).default(1) stellt sicher: nur positive Ganzzahlen, Standardwert ist 1.
      page: z.number().int().min(1).default(1).describe('Page number for pagination'),
    },
  },
  async ({ query, page = 1 }) => {
    try {
      const size = 10;
      const from = (page - 1) * size;
      const baseUrl = 'https://api.artic.edu/api/v1/artworks/search';
      const params = new URLSearchParams({
        q: query,
        size: size.toString(),
        from: from.toString(),
      });
      const response = await fetch(`${baseUrl}?${params}`);
      if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      const data = await response.json();
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: unknown) {
      // Im Fehlerfall geben wir eine lesbare Fehlermeldung zurück — kein Crash des Servers.
      // Das ist wichtig, damit der Client den Fehler sauber verarbeiten kann.
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          },
        ],
      };
    }
  },
);

// --- RESSOURCEN ---
// Eine Ressource ist kein aufrufbares Tool, sondern ein Datenpunkt, den ein Client *lesen* kann —
// ähnlich wie ein GET-Endpunkt in einer REST-API, ohne weitere Queries.
// registerResource() nimmt: einen Namen, ein URI-Template, Metadaten und einen Handler.
server.registerResource(
  'documentation',
  // ResourceTemplate definiert das URI-Muster für diese Ressource.
  // Clients können sie über 'docs://art-institute-of-chicago' abrufen.
  // { list: undefined } bedeutet, dass keine Auflistung aller Einträge unterstützt wird.
  new ResourceTemplate('docs://art-institute-of-chicago', { list: undefined }),
  {
    title: 'Documentation AIC',
    description: 'Returns full OpenAPI documentation for the Art Institute of Chicago API.',
  },
  // Der Handler erhält das aufgelöste URI-Objekt und gibt contents zurück —
  // ein Array mit uri und dem eigentlichen Textinhalt der Ressource.
  async (uri) => {
    try {
      const res = await fetch('https://api.artic.edu/api/v1/openapi.json');
      if (!res.ok) throw new Error(`Failed to fetch documentation: ${res.status} ${res.statusText}`);
      const doc = await res.json();
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(doc, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          },
        ],
      };
    }
  },
);

// --- TRANSPORT & VERBINDUNG ---
// StdioServerTransport nutzt stdin/stdout als Kommunikationskanal.
// Das ist der Standard für MCP-Server, die als lokale Prozesse laufen.
const transport = new StdioServerTransport();

// server.connect() startet den Event-Loop und wartet auf eingehende MCP-Nachrichten.
// Ab hier ist der Server bereit, Tools und Ressourcen zu bedienen.
await server.connect(transport);

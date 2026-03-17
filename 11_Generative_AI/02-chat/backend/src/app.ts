import cors from "cors";
import type { ErrorRequestHandler } from "express";
import express from "express";
import { OpenAI } from "openai/client.js";
import mongoose from "mongoose";

// ─── Datenbankverbindung ───────────────────────────────────────────────────────
// Kommt natürlich alles in seine eigenen Verzeichnisse und Dateien...
await mongoose.connect(process.env.MONGO_URI!, { dbName: "llm" });

// ─── Typen & Schema ────────────────────────────────────────────────────────────
// ChatMessage ist der offizielle OpenAI-Typ für eine einzelne Nachricht
// im Format { role: "user" | "assistant" | "system", content: "..." }
type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessage;

// ChatDocument erweitert das Mongoose-Dokument um ein history-Array,
// das den gesamten Gesprächsverlauf eines Chats enthält.
interface ChatDocument extends mongoose.Document {
  history: ChatMessage[];
}

// Mongoose-Schema: history wird als Array von beliebigen Objekten gespeichert
// der Einfachheit halber
const chatSchema = new mongoose.Schema<ChatDocument>({
  history: {
    type: [Object],
    default: [],
  },
});

// Mongoose-Modell für die "chats"-Collection in MongoDB
const Chat = mongoose.model("chat", chatSchema);

// ─── KI-Client ────────────────────────────────────────────────────────────────
// Hier wird der OpenAI-kompatible Client konfiguriert.
// Die auskommentierten Blöcke zeigen Alternativen:

//   1. Offizieller OpenAI-Dienst (Standard, kein baseURL nötig, sucht eigenständig nach einer OPENAI_API_KEY Umgebungsvariable)
// const client = new OpenAI();

//   2. Google Gemini über dessen OpenAI-kompatible API
const client = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

//   3. Lokales Modell via Ollama – kein API-Key erforderlich
// Lokales LLM über Ollama (läuft auf Port 11434)
// const client = new OpenAI({
//   baseURL: "http://127.0.0.1:11434/v1",
// });

// ─── Express-Setup ────────────────────────────────────────────────────────────
const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Running" });
});

// ─── System-Prompt ────────────────────────────────────────────────────────────
// Der System-Prompt definiert die Persönlichkeit und Regeln des Assistenten.
// Er wird beim Start jedes neuen Chats als erste Nachricht in die History eingefügt
const systemPrompt = {
  role: "system",
  content:
    // "Du bist ein Senior Software Architect und antwortest niemals mit Code auf programmierbezogene Fragen. Außerdem antwortest du nur sehr knapp in maximal 5 Sätzen.",
    "Du bist ein Coding-Enthusiast und antwortest gerne mit Code-Snippets, selbst wenn es eigtlich nicht passt.",
};

// ─── POST /messages ───────────────────────────────────────────────────────────
// Hauptendpunkt für Chatnachrichten (ohne Streaming).
// Erwartet im Body: { prompt: string, chatId?: string }
//   - Ohne chatId: neuer Chat wird angelegt (inkl. System-Prompt)
//   - Mit chatId:  bestehender Chat wird aus der DB geladen
app.post("/messages", async (req, res) => {
  const { prompt, chatId } = req.body;

  // Chat laden oder neu erstellen
  let chat: ChatDocument;
  if (!chatId) {
    chat = await Chat.create({ history: [systemPrompt] });
  } else {
    chat = (await Chat.findById(chatId)) as ChatDocument;
  }

  // Anfrage an das LLM senden.
  // Die gesamte bisherige History wird mitgeschickt – so "erinnert" sich das
  // Modell an den Gesprächsverlauf (Kontext-Fenster-Prinzip).
  const result = await client.chat.completions.create({
    // model: "gpt-5-mini",
    model: "gemini-3.1-flash-lite-preview",
    // model: "llama3.2",
    // Bisherige History + neue Nutzernachricht
    messages: [...chat.history, { role: "user", content: prompt }],

    // temperature steuert die Kreativität/Zufälligkeit der Antworten.
    // 0 = deterministisch, 2 = sehr kreativ/chaotisch
    // temperature: 1.5,
    // max_completion_tokens: 200,  // Antwortlänge begrenzen, wird bei manchen Modellein abgeschnitten
    // reasoning_effort: "minimal", // Nur bei Reasoning-Modellen (z. B. o3)
    // nicht alle Properties sind auf allen Modellen verfügbar
  });

  // Die Antwort des Modells aus dem Ergebnis extrahieren
  const answer = result.choices[0]?.message as ChatMessage;

  // History aktualisieren: Nutzernachricht + Modellantwort anhängen
  chat.history = [
    ...chat.history,
    { role: "user", content: prompt } as unknown as ChatMessage,
    answer,
  ];
  // Aktualisierten Chat in der Datenbank speichern
  chat.save();

  // Antwort und chatId zurückschicken – die chatId wird vom Frontend
  // für Folgenachrichten im selben Gespräch benötigt.
  res.json({ answer, chatId: chat._id });
});

// ─── POST /messages/streaming ─────────────────────────────────────────────────
// Streaming-Variante des Chat-Endpunkts.
// Statt auf die vollständige Antwort zu warten, wird jedes Stückchen
// der Antwort sofort an den Client geschickt
app.post("/messages/streaming", async (req, res) => {
  const { prompt, chatId } = req.body;

  // Chat laden oder neu erstellen (identisch zu /messages)
  let chat: ChatDocument;
  if (!chatId) {
    chat = await Chat.create({ history: [systemPrompt] });
  } else {
    chat = (await Chat.findById(chatId)) as ChatDocument;
  }

  // stream: true aktiviert den Streaming-Modus im OpenAI-Client.
  // Das Modell liefert die Antwort dann als AsyncIterator von Chunks
  // statt als einzelnes vollständiges Objekt.
  const result = await client.chat.completions.create({
    model: "gemini-3.1-flash-lite-preview",
    messages: [...chat.history, { role: "user", content: prompt }],
    stream: true,
  });

  // SSE-Header setzen, bevor Daten gesendet werden.
  // - text/event-stream: Teilt dem Browser mit, dass es sich um einen SSE-Stream handelt
  // - keep-alive:        Hält die TCP-Verbindung offen, bis der Stream endet
  // - no-cache:          Verhindert, dass Proxies oder Browser die Antwort puffern
  res.writeHead(200, {
    "content-type": "text/event-stream",
    connection: "keep-alive",
    "cache-control": "no-cache",
  });

  // Sammelt die vollständige Antwort
  let answer = "";

  // Das LLM liefert die Antwort in kleinen Paketen (Chunks).
  // Jeder Chunk enthält ein oder wenige neue Token im delta.content-Feld.
  for await (const chunk of result) {
    const text = chunk.choices[0]?.delta.content;
    console.log(text);
    answer += text; // Token zur Gesamtantwort hinzufügen

    // Leere Chunks (z. B. das abschließende Stop-Signal) überspringen,
    // damit kein leeres Event an den Client geschickt wird.
    if (!text) continue;

    // SSE-Format: jede Nachricht beginnt mit "data: " und endet mit zwei Zeilenumbrüchen.
    // Das Frontend kann diese Events mit einem EventSource-Objekt empfangen.
    res.write(`data: ${JSON.stringify(text)}\n\n`);
  }

  // Nach dem Stream: vollständige History in der DB persistieren.
  // Erst jetzt ist die komplette Antwort bekannt.
  chat.history = [
    ...chat.history,
    { role: "user", content: prompt } as unknown as ChatMessage,
    { role: "assistant", content: answer } as unknown as ChatMessage,
  ];
  chat.save();

  // Die chatId wird als eigener SSE-Event-Typ ("chat:") am Ende geschickt,
  // damit das Frontend weiß, welche ID es für Folgenachrichten verwenden soll.
  res.write(`chat: ${JSON.stringify(chat._id)}\n\n`);

  // Stream serverseitig beenden
  res.end();

  // Sicherheitsnetz: falls der Client die Verbindung trennt bevor res.end()
  // aufgerufen wurde, wird der Stream trotzdem sauber geschlossen.
  res.on("close", () => {
    res.end();
  });
});
app.post("/images", async (req, res) => {});

// ────────────────────────────────────────────────────
app.use("/{*splat}", () => {
  throw Error("Page not found", { cause: { status: 404 } });
});

app.use(((err, _req, res, _next) => {
  console.log(err);
  res.status(err.cause?.status || 500).json({ message: err.message });
}) satisfies ErrorRequestHandler);

app.listen(port, () => console.log(`AI Proxy listening on port ${port}`));

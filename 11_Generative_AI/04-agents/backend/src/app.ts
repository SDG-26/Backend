import cors from "cors";
import type { ErrorRequestHandler } from "express";
import express from "express";
import mongoose from "mongoose";
import { OpenAI } from "openai";
import { z } from "zod";

import { Agent, run, setDefaultOpenAIClient, tool } from "@openai/agents";
import type { AgentInputItem } from "@openai/agents";

await mongoose.connect(process.env.MONGO_URI!, { dbName: "llm-agents" });

// AgentInputItem ist der Typ für ein einzelnes Element in der Konversations-Historie
// (z.B. { role: "user", content: "..." } oder eine Tool-Call-Nachricht)
type ChatMessage = AgentInputItem;

interface ChatDocument extends mongoose.Document {
  history: ChatMessage[];
}

const chatSchema = new mongoose.Schema<ChatDocument>({
  history: {
    type: [Object],
    default: [],
  },
});

const Chat = mongoose.model("chat", chatSchema);

const client = new OpenAI();

// setDefaultOpenAIClient registriert den Client global –
// alle Agents in dieser App nutzen ihn automatisch, ohne ihn pro Agent angeben zu müssen.
// Das ermöglicht auch den einfachen Austausch gegen andere OpenAI-kompatible Anbieter (s. Kommentare unten)

// Alternativ: Google Gemini
// const client = new OpenAI({
//   apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
//   baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
// });

// Alternativ: Lokales Modell mit Ollama
// const client = new OpenAI({
//   baseURL: 'http://127.0.0.1:11434',
// });

setDefaultOpenAIClient(client);

const port = process.env.PORT || 8080;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Running" });
});

// Ein Agent wird einmal definiert und ist dann wiederverwendbar.
// `instructions` entspricht dem System-Prompt.
// `modelSettings` erlaubt feingranulare Steuerung von Reasoning und Output-Stil.
const chatAgent = new Agent({
  name: "Nerdy Chat Agent",
  model: "gpt-5",
  instructions:
    "You are a very nerdy Agent. You try to steer every conversation towards Star Trek or Dungeons & Dragons. No matter what.",
  modelSettings: {
    // reasoning.effort steuert, wie viel "Denkarbeit" das Modell investiert (low/medium/high)
    reasoning: { effort: "low" },
    // text.verbosity beeinflusst die Länge/Ausführlichkeit der Antwort
    text: { verbosity: "low" },
  },
});

app.post("/messages", async (req, res) => {
  const { prompt, chatId } = req.body;
  // Chat-Historie aus DB laden oder neue erstellen
  let chat: ChatDocument;
  if (!chatId) {
    chat = await Chat.create({ history: [] });
  } else {
    chat = (await Chat.findById(chatId)) as ChatDocument;
    if (!chat) throw new Error("Invalid ChatID");
  }

  // `run()` führt den Agenten aus. Als zweites Argument wird die vollständige
  // Konversations-Historie übergeben – der neue User-Prompt wird direkt angehängt.
  // Das SDK verwaltet intern mehrere LLM-Aufrufe, falls nötig (z.B. bei Tool-Calls).
  const result = await run(chatAgent, chat.history.concat({ role: "user", content: prompt }));

  // result.history enthält die aktualisierte, vollständige Historie inkl. Antwort des Agents –
  // bereit zum Speichern und für den nächsten Aufruf.
  chat.history = result.history;
  await chat.save();

  // result.finalOutput ist die finale Text-Antwort des Agents
  res.json({ result: result.finalOutput, chatId: chat._id });
});

// `tool()` definiert ein Werkzeug, das ein Agent aufrufen kann.
// Das SDK übernimmt das Parsen der LLM-Ausgabe und ruft `execute()` automatisch auf.
const pokeTool = tool({
  name: "poke_info",
  description: "Get information about a Pokémon by name or ID",
  // `parameters` als Zod-Schema: Das SDK generiert daraus automatisch den JSON-Schema-
  // beschreibung für das LLM und validiert die Tool-Argumente zur Laufzeit.
  parameters: z.object({
    pokemon: z.string().describe("The name or the id of a Pokémon"),
  }),
  // `execute` wird aufgerufen, sobald das Modell entscheidet, dieses Tool zu nutzen.
  // Der Rückgabewert wird automatisch als Tool-Ergebnis zurück ans Modell gesendet.
  async execute(input) {
    console.log("RUNNING TOOL WITH INTPUT: ", input);

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${input.pokemon}`);
    const data = await res.json();

    return JSON.stringify(data);
  },
});

const pokeAgent = new Agent({
  name: "Pokemon Agent",
  instructions: `
- You have ONE tool: pokemon_info. Use it ONLY if the user asks about a Pokémon.
- For tacos: DO NOT use any tools. Answer with exactly a 3-line haiku (5-7-5).
- For other topics: reply briefly, no tools.
- Never invent tools. Only pokemon_info exists.
  `,
  model: "gpt-5-mini",
  // Tools werden dem Agent bei der Initialisierung übergeben –
  // das LLM kennt dadurch ihre Namen, Beschreibungen und Parameter.
  tools: [pokeTool],
});

app.post("/pokemon", async (req, res) => {
  const { prompt } = req.body;

  // Wird der Agent mit einem einfachen String gestartet, behandelt das SDK ihn
  // automatisch als erste User-Nachricht – kein manuelles Aufbauen der Historie nötig.
  const result = await run(pokeAgent, prompt);

  res.json({ result: result.finalOutput });
});

app.use("/{*splat}", () => {
  throw Error("Page not found", { cause: { status: 404 } });
});

app.use(((err, _req, res, _next) => {
  console.log(err);
  res.status(err.cause?.status || 500).json({ message: err.message });
}) satisfies ErrorRequestHandler);

app.listen(port, () => console.log(`AI Proxy with OpenAI Agents SDK listening on port ${port}`));

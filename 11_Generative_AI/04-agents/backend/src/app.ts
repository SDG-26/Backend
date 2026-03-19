import cors from "cors";
import type { ErrorRequestHandler } from "express";
import express from "express";
import mongoose from "mongoose";
import { OpenAI } from "openai";
import { z } from "zod";

import {
  Agent,
  handoff,
  InputGuardrailTripwireTriggered,
  OutputGuardrailTripwireTriggered,
  run,
  setDefaultOpenAIClient,
  tool,
} from "@openai/agents";
import type { AgentInputItem, InputGuardrail, OutputGuardrail } from "@openai/agents";

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

const client = new OpenAI({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

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
    console.log("RUNNING TOOL WITH INPUT: ", input);

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

// ───  Handoffs ─────────────────────────────────────────────────────

const customerSupportAgent = new Agent({
  name: "Customer Support Agent",
  instructions: `You are a customer support agent in a company that sells very fluffy pillows. Be friendly, helpful. and concise.`,
  model: "gpt-5",
});

const escalationControlAgent = new Agent({
  name: "Escalation Control Agent",
  instructions: `You are an escalation control agent that handles negative customer interactions. 
  If the customer is upset, you will apologize and offer to escalate the issue to a manager.
Be friendly, helpful, reassuring and concise.`,
  model: "gpt-4o",
});

// Der Triage-Agent ist der Einstiegspunkt. Er entscheidet selbst, an wen er weitergibt –
const triageAgent = new Agent({
  name: "Pillow Triage",
  instructions: `NEVER answer non-pillow related questions and stop the conversation immediately. Do not handoff, when the topic is unrelated to our pillows.
  If the question is about pillows, route it to the Customer Support Agent. 
  If the customer's tone is negative, route it to the Escalation Control Agent.`,
  model: "gpt-5-nano",
  // `handoffs` listet alle Agenten, an die dieser Agent delegieren darf.
  // Das SDK macht diese als auswählbare "Tools" für das LLM verfügbar.
  handoffs: [
    // Einfacher Handoff: Der Agent wird direkt übergeben, ohne zusätzliche Konfiguration.
    customerSupportAgent,
    // Erweiterter Handoff mit `handoff()`: Erlaubt ein typisiertes Input-Schema und
    // einen `onHandoff`-Hook, der vor der Übergabe ausgeführt wird (z.B. für Logging).
    handoff(escalationControlAgent, {
      // Das LLM muss beim Handoff strukturierte Daten in diesem Format liefern.
      inputType: z.object({ reason: z.string() }),
      // Wird aufgerufen, sobald das LLM den Handoff auslöst – ideal für Side-Effects, z.B. Email, Slack-Notification, Ping...
      onHandoff: async (context, input) => {
        console.log(context);
        console.log("HANDOFF INPUT: ", input);
      },
    }),
  ],
});

app.post("/pillow-support", async (req, res) => {
  const { prompt } = req.body;

  const result = await run(triageAgent, prompt);

  res.json({ result: result.finalOutput });
});

// ───  Guardrails ───────────────────────────────────────────────────

const BoardSchema = z.object({
  board: z.array(z.array(z.enum(["", "X", "O"])).length(3)).length(3),
});

// InputGuardrail: Wird VOR dem LLM-Aufruf ausgeführt.
// Gibt `tripwireTriggered: true` zurück, um den Aufruf abzubrechen.
const validateClientMove: InputGuardrail = {
  name: "Client Move Valiadation",
  async execute({ input }) {
    let tripwireTriggered = false;
    let outputInfo = "Valid client move";

    try {
      // Eigene Validation (was hier z.B. fehlt, ist ein Check, ob das Spiel schon vorbei ist)
      const parsed = JSON.parse(input as string);
      const { board } = BoardSchema.parse(parsed);

      let countX = 0;
      let countO = 0;

      board.flat().forEach((cell) => {
        if (cell === "X") countX++;
        if (cell === "O") countO++;
      });

      if (countX !== countO + 1) {
        tripwireTriggered = true;
        outputInfo = "Invalid move: X must have exactly one more piece on the board than O.";
      }
    } catch {
      tripwireTriggered = true;
      outputInfo =
        "Invalid move: Input could not be parsed or does not match the 3x3 board schema.";
    }

    return { tripwireTriggered, outputInfo }; // muss immer dieses Objekt zurückgeben
  },
};

// OutputGuardrail: Wird *nach* dem LLM-Aufruf ausgeführt und erhält das typisierte Ergebnis.
// Nützlich um zu prüfen, ob der Agent sich korrekt verhalten hat.
const validAgentMoveGuardrail: OutputGuardrail<typeof BoardSchema> = {
  name: "Agent Move Validation",
  async execute({ agentOutput }) {
    let tripwireTriggered = false;
    let outputInfo = "Valid agent move.";

    // Eingene Validationslogik
    // Was hier bspw. fehlt, ist die Überprüfung,
    // ob unser Board auch wirklich nur um ein "O" ergänzt wurde
    // und nicht nicht die Buchstaben durcheinandergewürfelt wurden...
    const { board } = agentOutput;

    let countX = 0;
    let countO = 0;

    board.flat().forEach((cell) => {
      if (cell === "X") countX++;
      if (cell === "O") countO++;
    });

    if (countX !== countO) {
      tripwireTriggered = true;
      outputInfo = "Invalid agent move.";
    }
    //

    return { tripwireTriggered, outputInfo };
  },
};

const ticTacToeAgent = new Agent({
  name: "Tic Tac Toe Player",
  model: "google/gemini-3.1-flash-lite-preview",
  // model: "anthropic/claude-haiku-4.6",
  // model: "openai/gpt-5.4-mini",
  instructions: `You are an expert Tic-Tac-Toe player playing as 'O'. 
  You will receive a 3x3 board where the user has just played 'X'. 
  Make your next move by placing an 'O' in exactly one empty spot (""). 
  Do not change any existing 'X' or 'O's. Return the updated board.`,
  inputGuardrails: [validateClientMove],
  outputGuardrails: [validAgentMoveGuardrail],
  // `outputType` mit einem Zod-Schema erzwingt strukturierte JSON-Ausgabe.
  // result.finalOutput ist dann direkt als typisiertes Objekt verfügbar – kein manuelles Parsen nötig.
  outputType: BoardSchema,
});

app.post("/play", async (req, res) => {
  const { board } = req.body;

  const inputStr = JSON.stringify({ board });
  try {
    const result = await run(ticTacToeAgent, inputStr);
    // hier könnte der Spielverlauf in der Datenbank gespeichert werden

    // --> Extra Bonusaufgabe: Wie können wir den Zustand überprüfen, ob ein Spieler gewonnen hat? <-- //

    res.json({ result: result.finalOutput });
  } catch (error) {
    // Wird geworfen, wenn ein InputGuardrail `tripwireTriggered: true` zurückgibt.
    // Der LLM-Aufruf hat in diesem Fall nie stattgefunden.
    if (error instanceof InputGuardrailTripwireTriggered) {
      return res.status(400).json({
        error: "Ungültiger Spielzug vom Client. Es dürfen nur valide X-Züge eingereicht werden.",
      });
    }
    // Wird geworfen, wenn ein OutputGuardrail `tripwireTriggered: true` zurückgibt.
    // Das Modell hat geantwortet, aber die Antwort hat die Validierung nicht bestanden.
    if (error instanceof OutputGuardrailTripwireTriggered) {
      // const result = await run(ticTacToeAgent, inputStr); // Möglichkeit für Retries
      return res.status(500).json({
        error: "Der Agent hat einen ungültigen Zug gemacht und wurde gestoppt. Versuche es erneut.",
      });
    }
  }
});

app.use("/{*splat}", () => {
  throw Error("Page not found", { cause: { status: 404 } });
});

app.use(((err, _req, res, _next) => {
  console.log(err);
  res.status(err.cause?.status || 500).json({ message: err.message });
}) satisfies ErrorRequestHandler);

app.listen(port, () => console.log(`AI Proxy with OpenAI Agents SDK listening on port ${port}`));

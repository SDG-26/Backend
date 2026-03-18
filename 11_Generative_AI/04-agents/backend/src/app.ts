import cors from "cors";
import type { ErrorRequestHandler } from "express";
import express from "express";
import mongoose from "mongoose";
import { OpenAI } from "openai";
import { z } from "zod";

await mongoose.connect(process.env.MONGO_URI!, { dbName: "chat" });

const chatSchema = new mongoose.Schema({
  history: {
    type: [Object],
    default: [],
  },
});

const Chat = mongoose.model("chat", chatSchema);

const client = new OpenAI();

// Alternativ: Google Gemini
// const client = new OpenAI({
//   apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
//   baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
// });

// Alternativ: Lokales Modell mit Ollama
// const client = new OpenAI({
//   baseURL: 'http://127.0.0.1:11434',
// });

const port = process.env.PORT || 8080;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Running" });
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

  //  Call to Action

  await chat.save();
});

app.use("/{*splat}", () => {
  throw Error("Page not found", { cause: { status: 404 } });
});

app.use(((err, _req, res, _next) => {
  console.log(err);
  res.status(err.cause?.status || 500).json({ message: err.message });
}) satisfies ErrorRequestHandler);

app.listen(port, () => console.log(`AI Proxy with OpenAI Agents SDK listening on port ${port}`));

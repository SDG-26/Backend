import cors from "cors";
import type { ErrorRequestHandler } from "express";
import express from "express";
import { OpenAI } from "openai/client.js";
import mongoose from "mongoose";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

await mongoose.connect(process.env.MONGO_URI!, { dbName: "llm" });

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessage;
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
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});
const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Running" });
});

const systemPrompt = {
  role: "system",
  content:
    // "Du bist ein Senior Software Architect und antwortest niemals mit Code auf programmierbezogene Fragen. Außerdem antwortest du nur sehr knapp in maximal 5 Sätzen.",
    "Du bist ein Coding-Enthusiast und antwortest gerne mit Code-Snippets, selbst wenn es eigtlich nicht passt.",
};

app.post("/messages", async (req, res) => {
  const { prompt, chatId } = req.body;

  let chat: ChatDocument;
  if (!chatId) {
    chat = await Chat.create({ history: [systemPrompt] });
  } else {
    chat = (await Chat.findById(chatId)) as ChatDocument;
  }

  const result = await client.chat.completions.create({
    // model: "gpt-5-mini",
    model: "gemini-3.1-flash-lite-preview",
    // model: "llama3.2",
    messages: [...chat.history, { role: "user", content: prompt }],
  });

  const answer = result.choices[0]?.message as ChatMessage;

  chat.history = [
    ...chat.history,
    { role: "user", content: prompt } as unknown as ChatMessage,
    answer,
  ];
  chat.save();

  res.json({ answer, chatId: chat._id });
});

app.post("/messages/streaming", async (req, res) => {
  const { prompt } = req.body;
  const chatId = req.headers["x-chat-id"];

  let chat: ChatDocument;
  if (!chatId) {
    chat = await Chat.create({ history: [systemPrompt] });
  } else {
    chat = (await Chat.findById(chatId)) as ChatDocument;
  }

  const stream = client.chat.completions.stream({
    model: "gemini-3.1-flash-lite-preview",
    messages: [...chat.history, { role: "user", content: prompt }],
    stream: true,
  });

  res.set({
    "content-type": "text/plain; charset=utf-8",
    "x-chat-id": (chat._id as mongoose.ObjectId).toString(),
    "access-control-expose-headers": "x-chat-id",
  });

  for await (const chunk of stream.toReadableStream()) {
    res.write(chunk);
  }
  const answer = await stream.finalMessage();
  const { content } = answer;

  chat.history = [
    ...chat.history,
    { role: "user", content: prompt } as unknown as ChatMessage,
    { role: "assistant", content: content } as unknown as ChatMessage,
  ];
  await chat.save();
  res.end();
});

// ────────────────────────────────────────────────────

app.post("/images", async (req, res) => {
  const { prompt } = req.body;

  const result = await client.images.generate({
    prompt: prompt,
    model: "imagen-4.0-generate-001",
    response_format: "b64_json",
  });

  // base64 speichern, Cloudinary, AWS...

  res.json(result);
});

// ────────────────────────────────────────────────────

const Recipe = z.object({
  title: z.string(),
  nop: z
    .number()
    .describe("Numbers of persons the recipe is designed for. Default to 4 if not stated else."),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z
        .string()
        .describe("The unit of the quantity of the ingredient. Use metric units if possible"),
    }),
  ),
  time_in_minutes: z.number(),
  preparations_description: z.string().max(2000),
});

app.post("/recipes", async (req, res) => {
  const { prompt } = req.body;

  const recipe = await client.chat.completions.parse({
    model: "gemini-3.1-flash-lite-preview",
    messages: [
      {
        role: "system",
        content:
          "You are an innovative chef who likes to create new cooking recipes. You really like pepper.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: zodResponseFormat(Recipe, "recipe"),
  });

  res.json({ recipe: recipe.choices[0]?.message.parsed });
});

// ────────────────────────────────────────────────────
app.use("/{*splat}", () => {
  throw Error("Page not found", { cause: { status: 404 } });
});

app.use(((err, _req, res, _next) => {
  console.log(err);
  res.status(err.cause?.status || 500).json({ message: err.message });
}) satisfies ErrorRequestHandler);

app.listen(port, () => console.log(`AI Proxy listening on port ${port}`));

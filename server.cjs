const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { createOpenAI } = require("@ai-sdk/openai");
const { streamText } = require("ai");

const app = express();

app.use(cors());
app.use(express.json());

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const result = streamText({
      model: openrouter("openrouter/free"),
      messages,
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const textPart of result.textStream) {
      res.write(textPart);
    }

    res.end();

  } catch (error) {
    console.error("AI error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to generate AI response",
      });
    }
  }
});

app.listen(5000, () => {
  console.log(
    "Growfinix AI server running on http://localhost:5000"
  );
});
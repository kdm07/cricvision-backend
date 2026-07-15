"use strict";

const Groq = require("groq-sdk");

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

let client = null;

function getClient() {
  if (client) return client;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  client = new Groq({
    apiKey,
  });

  return client;
}

async function generateResponse(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required.");
  }

  const groq = getClient();

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.6,
    max_completion_tokens: 2048,
  });

  return {
    text: completion.choices[0].message.content,
    tokensUsed: completion.usage?.total_tokens ?? null,
    model: MODEL,
  };
}

module.exports = {
  generateResponse,
};

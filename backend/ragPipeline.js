import Groq from "groq-sdk";
import { searchDocuments } from "./vectorStore.js";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store chat history per session so the bot remembers earlier messages
const sessions = {};

export async function askQuestion(question, sessionId = "default") {
  // Step 1: Search ChromaDB for the 4 most relevant chunks
  const relevantChunks = await searchDocuments(question, 4);
  const context =
    relevantChunks.length > 0
      ? relevantChunks.join("\n\n")
      : "No relevant documents found.";

  // Step 2: Get or create this session's chat history
  if (!sessions[sessionId]) {
    sessions[sessionId] = [];
  }
  const history = sessions[sessionId];

  // Step 3: Build the full message list for Groq
  const messages = [
    {
      role: "system",
      content: `You are a helpful and friendly banking support assistant for an Indian bank.
Answer customer questions ONLY based on the banking context provided below.
If the answer is not found in the context, say: "I don't have specific information about that. Please contact our branch or call our 24/7 helpline for assistance."
Keep answers clear, concise, and helpful. Use simple language that any customer can understand.
Always be polite and professional.

BANKING KNOWLEDGE BASE:
${context}`,
    },
    ...history, // All previous messages in this conversation
    {
      role: "user",
      content: question,
    },
  ];

  // Step 4: Call Groq API (free LLaMA3 model)
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: messages,
    temperature: 0.1, // Low = more factual, less creative
    max_tokens: 600,
  });

  const answer = response.choices[0].message.content;

  // Step 5: Save this exchange to session memory
  history.push({ role: "user", content: question });
  history.push({ role: "assistant", content: answer });

  // Keep only the last 10 messages to avoid token limits
  if (history.length > 10) {
    sessions[sessionId] = history.slice(-10);
  }

  return {
    answer,
    sources: relevantChunks,
    session_id: sessionId,
  };
}

// Clear a session's history (for new conversations)
export function clearSession(sessionId) {
  if (sessions[sessionId]) {
    delete sessions[sessionId];
  }
}
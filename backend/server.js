import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { buildVectorStore } from "./vectorStore.js";
import { askQuestion, clearSession } from "./ragPipeline.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer: saves uploaded files to the documents/ folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const docsPath = path.join(__dirname, "../documents");
    if (!fs.existsSync(docsPath)) fs.mkdirSync(docsPath, { recursive: true });
    cb(null, docsPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original filename
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"));
    }
  },
});

// ─────────────────────────────────────────────
// ROUTE 1: GET /health
// Used by evaluators to check if the server is running
// ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Banking Support Chatbot is running",
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// ROUTE 2: POST /chat
// Main chat endpoint — accepts a message and returns an AI answer
// Body: { message: string, session_id: string }
// ─────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { message, session_id = "default" } = req.body;

    // Validate input
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        error: "Invalid input",
        message: "Please provide a non-empty message",
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        error: "Message too long",
        message: "Message must be under 1000 characters",
      });
    }

    console.log(`[CHAT] Session: ${session_id} | Question: ${message}`);

    const result = await askQuestion(message.trim(), session_id);

    res.json({
      answer: result.answer,
      session_id: result.session_id,
      sources_count: result.sources.length,
    });
  } catch (error) {
    console.error("[CHAT ERROR]", error.message);
    res.status(500).json({
      error: "Server error",
      message: "Something went wrong. Please try again.",
    });
  }
});

// ─────────────────────────────────────────────
// ROUTE 3: POST /upload
// Upload a PDF or TXT file and rebuild the vector store
// Form field name must be "file"
// ─────────────────────────────────────────────
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file",
        message: "Please upload a PDF or TXT file",
      });
    }

    console.log(`[UPLOAD] File received: ${req.file.originalname}`);

    // Rebuild the entire vector store to include the new file
    await buildVectorStore();

    res.json({
      message: `File '${req.file.originalname}' uploaded and indexed successfully`,
      filename: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error("[UPLOAD ERROR]", error.message);
    res.status(500).json({
      error: "Upload failed",
      message: error.message,
    });
  }
});

// ─────────────────────────────────────────────
// ROUTE 4: POST /clear-session
// Clears conversation history for a session
// Body: { session_id: string }
// ─────────────────────────────────────────────
app.post("/clear-session", (req, res) => {
  const { session_id = "default" } = req.body;
  clearSession(session_id);
  res.json({ message: "Session cleared", session_id });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server and immediately build the vector store
app.listen(PORT, async () => {
  console.log("");
  console.log("╔═══════════════════════════════════════╗");
  console.log("║   Banking Support Chatbot - Backend   ║");
  console.log("╚═══════════════════════════════════════╝");
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`Health check:      http://localhost:${PORT}/health`);
  console.log("");

  // Build vector store on startup
  try {
    await buildVectorStore();
    console.log("Ready to answer banking questions!");
  } catch (err) {
    console.error("Failed to build vector store:", err.message);
    console.error("Make sure ChromaDB is running: chroma run --path ./chroma_db");
  }
});
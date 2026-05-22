import { ChromaClient } from "chromadb";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { pipeline } from "@xenova/transformers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_PATH = path.join(__dirname, "../documents");

const client = new ChromaClient({ path: "http://localhost:8000" });
let embedder = null;

// Load the free HuggingFace embedding model (runs 100% locally, no API key needed)
async function getEmbedder() {
  if (!embedder) {
    console.log("Loading embedding model... (first time takes ~30 seconds)");
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("Embedding model loaded!");
  }
  return embedder;
}

// Convert any text into a list of numbers (embedding)
export async function embedText(text) {
  const fn = await getEmbedder();
  const output = await fn(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

// Read all files from the documents/ folder
async function loadDocuments() {
  if (!fs.existsSync(DOCS_PATH)) {
    fs.mkdirSync(DOCS_PATH, { recursive: true });
  }

  const files = fs.readdirSync(DOCS_PATH);
  const allDocs = [];

  for (const file of files) {
    const filepath = path.join(DOCS_PATH, file);

    if (file.endsWith(".txt")) {
      const content = fs.readFileSync(filepath, "utf-8");
      allDocs.push({ pageContent: content, metadata: { source: file } });
      console.log(`Loaded TXT: ${file}`);
    } else if (file.endsWith(".pdf")) {
      const buffer = fs.readFileSync(filepath);
      const data = await pdfParse(buffer);
      allDocs.push({ pageContent: data.text, metadata: { source: file } });
      console.log(`Loaded PDF: ${file}`);
    }
  }

  if (allDocs.length === 0) {
    console.warn("Warning: No documents found in documents/ folder");
  }

  return allDocs;
}

// Build the ChromaDB vector store from all documents
export async function buildVectorStore() {
    console.log("Building vector store...");
  
    const docs = await loadDocuments();
  
    // Split documents into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
  
    const chunks = [];
  
    for (const doc of docs) {
      const split = await splitter.splitText(doc.pageContent);
  
      split.forEach((text) => {
        chunks.push({
          text,
          source: doc.metadata.source,
        });
      });
    }
  
    console.log(`Created ${chunks.length} chunks from ${docs.length} documents`);
  
    // Reset collection
    let collection;
  
    try {
      await client.deleteCollection({ name: "banking_docs" });
    } catch (e) {
      // ignore if collection doesn't exist
    }
  
    collection = await client.createCollection({
      name: "banking_docs",
    });
  
    // Generate embeddings
    console.log("Generating embeddings... (this may take a minute)");
  
    const batchSize = 10;
  
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
  
      const ids = batch.map((_, j) => `chunk_${i + j}`);
      const texts = batch.map((c) => c.text);
  
      // FIXED: load embedding model only once
      const embeddings = [];
  
      for (const text of texts) {
        const embedding = await embedText(text);
        embeddings.push(embedding);
      }
  
      const metadatas = batch.map((c) => ({
        source: c.source,
      }));
  
      await collection.upsert({
        ids,
        embeddings,
        documents: texts,
        metadatas,
      });
  
      console.log(
        `Indexed ${Math.min(i + batchSize, chunks.length)}/${chunks.length} chunks`
      );
    }
  
    console.log("Vector store ready!");
  
    return collection;
  }

// Search ChromaDB for the most relevant chunks to a user's question
export async function searchDocuments(query, topK = 4) {
  try {
    const collection = await client.getCollection({ name: "banking_docs" });
    const queryEmbedding = await embedText(query);

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    });

    return results.documents[0] || [];
  } catch (e) {
    console.error("Search error:", e.message);
    return [];
  }
}
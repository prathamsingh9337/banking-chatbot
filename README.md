# 🏦 AI Banking Support Chatbot

An AI-powered Banking Support Chatbot built using Retrieval-Augmented Generation (RAG) architecture to provide accurate, context-aware, and grounded banking support responses.

This project was developed as part of an AI Engineer assignment focused on evaluating practical Generative AI engineering skills, vector database understanding, backend API development, and production-oriented deployment.

---

# 🚀 Live Demo 

## Frontend

https://banking-chatbot-eta.vercel.app/

## Backend API

https://banking-chatbot-api-asrx.onrender.com/



## project link 

https://banking-chatbot-eta.vercel.app/

## demo video link 

https://drive.google.com/file/d/1vhQXOmf8WotHQhkX1oGVKfst9bmvZcQ4/view?usp=drive_link

---


# Installation & Setup

## Clone Repository

git clone <your-github-repo>

## Backend Setup

cd backend

npm install

npm start

## Frontend Setup

Open index.html using Live Server


----

# 📌 Project Overview

Traditional chatbots often generate generic or hallucinated answers because they rely only on the language model’s pre-trained knowledge.

To solve this problem, this chatbot uses a Retrieval-Augmented Generation (RAG) pipeline.

Instead of answering blindly, the system:

1. Retrieves relevant banking information from documents
2. Performs semantic similarity search using embeddings
3. Sends only relevant context to the LLM
4. Generates grounded and context-aware responses

This makes the chatbot more reliable, scalable, and suitable for real-world banking support scenarios.

---

# ✨ Key Features

* AI-powered conversational banking assistant
* Retrieval-Augmented Generation (RAG) pipeline
* Semantic search using vector embeddings
* Context-aware responses
* Banking FAQ knowledge retrieval
* Session-based conversational memory
* REST API architecture
* Cloud deployment using free-tier services
* Fast and lightweight frontend UI
* Scalable backend structure

---

# 🧠 Problems This Project Solves

The chatbot is designed to help users with:

* Personal loan information
* Credit card queries
* Banking FAQs
* Interest rates and eligibility questions
* Policy and procedure assistance
* Banking support knowledge retrieval

Example:

User:

> What is a personal loan?

Follow-up:

> What is the interest rate for it?

The chatbot maintains conversational context and understands that “it” refers to the previously discussed personal loan.

---

# 🏗️ System Architecture

```text
User
  ↓
Frontend (HTML/CSS/JavaScript)
  ↓
Express.js Backend API
  ↓
RAG Pipeline
  ↓
ChromaDB Vector Store
  ↓
Groq LLM
```

---

# 🔄 RAG Pipeline Flow

## 1. Document Ingestion

Banking-related TXT documents are loaded into the system.

Examples:

* Banking FAQs
* Loan policies
* Credit card information
* Customer support knowledge

---

## 2. Text Chunking

Large documents are split into smaller chunks.

Why?

* Improves retrieval accuracy
* Reduces irrelevant context
* Helps semantic search perform better

---

## 3. Embedding Generation

Each chunk is converted into vector embeddings using transformer-based embedding models.

Embeddings capture semantic meaning instead of relying on exact keyword matching.

---

## 4. Vector Storage

Embeddings are stored in ChromaDB.

Why ChromaDB?

* Free and lightweight
* Easy integration
* Efficient semantic similarity search
* Good for RAG-based applications

---

## 5. Semantic Retrieval

When the user asks a question:

* The query is converted into embeddings
* Similar document chunks are retrieved from ChromaDB
* Top relevant chunks are selected

---

## 6. Context-Aware Response Generation

The retrieved chunks are sent to the LLM along with the user query.

The LLM generates grounded and context-aware answers based on retrieved banking information.

---

# 🛠️ Tech Stack

## Frontend

* HTML
* CSS
* JavaScript

## Backend

* Node.js
* Express.js

## AI & RAG

* LangChain
* Groq API
* ChromaDB
* Embeddings
* Semantic Search

## Deployment

* Render (Backend)
* Vercel (Frontend)

---

# 📂 Project Structure

```text
banking-chatbot/
│
├── backend/
│   ├── server.js
│   ├── ragPipeline.js
│   ├── vectorStore.js
│   ├── package.json
│   └── .env
│
├── documents/
│   └── banking_faq.txt
│
├── frontend/
│   ├── index.html
│   ├── index.js
│   └── style.css
│
├── README.md
└── .gitignore
```

---

# 🔌 Backend APIs

## POST `/chat`

Used for chatbot conversation.

### Request

```json
{
  "message": "What is a personal loan?"
}
```

### Response

```json
{
  "reply": "A personal loan is an unsecured loan provided by banks..."
}
```

---

## GET `/health`

Used to check backend health status.

### Response

```json
{
  "status": "ok"
}
```

---

# 💬 Conversational Memory

The chatbot maintains session-based conversation context.

This enables:

* Follow-up questions
* Better conversational flow
* Context-aware banking assistance

This significantly improves user experience compared to stateless chat systems.

---

# 🌐 Deployment

## Frontend Deployment

Deployed on Vercel.

## Backend Deployment

Deployed on Render.

The application is fully cloud-hosted and publicly accessible.

---

# ⚡ Challenges Faced

During development, several practical engineering challenges were addressed:

* Managing dependency conflicts during deployment
* Handling CORS issues between frontend and backend
* Optimizing retrieval quality for banking queries
* Structuring the RAG pipeline efficiently
* Maintaining conversation context
* Deploying vector-based AI applications on free-tier services

These challenges provided valuable real-world backend and AI engineering experience.

---

# 📈 Future Improvements

Potential future enhancements include:

* PDF and DOCX ingestion support
* Authentication and user accounts
* Redis caching
* Streaming AI responses
* Better conversation memory
* Multi-language support
* Reranking models for retrieval optimization
* Admin dashboard for document management
* Fine-tuned banking-specific models

---

# 🎯 Learning Outcomes

This project helped strengthen understanding of:

* Generative AI application development
* Retrieval-Augmented Generation (RAG)
* Embedding models and semantic search
* Vector databases
* Backend API architecture
* Production deployment workflows
* Cloud-based AI application hosting

---

# 📸 Suggested Screenshots

You can add:

* Chatbot UI screenshot
* Architecture diagram
* Deployment screenshot
* API testing screenshot

---

# 👨‍💻 Author

Pratham Singh

B.Tech – Full Stack AI

Passionate about building scalable AI-powered applications focused on solving practical real-world problems.

---

# ⭐ Final Note

This project was designed with a strong focus on practical AI engineering rather than only UI implementation.

The primary goal was to build a grounded, deployable, and production-oriented RAG-based banking assistant capable of retrieving accurate information and generating meaningful responses in real time.

The project demonstrates the integration of:

* AI engineering
* Backend system design
* Vector databases
* Semantic retrieval
* Cloud deployment
* Conversational AI

into a complete end-to-end working application.


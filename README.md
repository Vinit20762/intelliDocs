# IntelliDocs — Chat with any PDF using AI

IntelliDocs is an AI-powered SaaS that lets you upload any PDF and have a natural conversation with it. Ask questions, get summaries, and extract insights — all powered by GPT-4 and Retrieval-Augmented Generation (RAG).

---

## Features

- **PDF Upload** — Drag and drop any PDF (up to 10MB), stored securely on AWS S3
- **AI Chat** — Ask questions about your PDF in natural language, powered by GPT-4
- **Streaming Responses** — Real-time token-by-token streaming via Vercel AI SDK
- **Chat History** — All conversations are persisted and accessible from the sidebar
- **Multi-document** — Upload and switch between multiple PDFs, each with its own chat
- **Delete Chats** — Permanently remove a chat and its PDF from S3 and the database
- **Authentication** — Secure user auth with Clerk (sign in, sign up, session management)
- **Collapsible Sidebar** — Full/icon-only sidebar with smooth transitions
- **Thinking Indicator** — Animated typing dots while the AI is generating a response

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Clerk |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| File Storage | AWS S3 |
| Vector DB | Pinecone |
| LLM | OpenAI GPT-4 |
| Embeddings | OpenAI text-embedding-ada-002 |
| AI SDK | Vercel AI SDK + LangChain |
| Data Fetching | TanStack React Query |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Next.js)                     │
│                                                             │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────────┐  │
│  │ Sidebar  │   │  PDF Viewer  │   │    Chat Panel      │  │
│  │ (chats)  │   │ (Google Docs │   │  (messages +       │  │
│  │          │   │   iframe)    │   │   input form)      │  │
│  └──────────┘   └──────────────┘   └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                                      │
         │ upload PDF                           │ send message
         ▼                                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                       │
│                                                             │
│  /api/create-chat    /api/chat    /api/delete-chat          │
│  /api/get-messages                                          │
└─────────────────────────────────────────────────────────────┘
         │                                      │
    ┌────┴────┐                         ┌───────┴───────┐
    │  AWS S3 │                         │   Neon (PG)   │
    │ (PDFs)  │                         │ chats/messages│
    └────┬────┘                         └───────────────┘
         │
    ┌────┴────────────────────┐
    │   PDF Processing        │
    │                         │
    │  1. Download from S3    │
    │  2. Parse with pdf-parse│
    │  3. Split into chunks   │
    │     (LangChain)         │
    │  4. Embed each chunk    │
    │     (OpenAI ada-002)    │
    │  5. Upsert to Pinecone  │
    └────┬────────────────────┘
         │
    ┌────┴────┐
    │Pinecone │
    │(vectors)│
    └─────────┘
```

---

## RAG Pipeline (Retrieval-Augmented Generation)

RAG allows the AI to answer questions **grounded in your PDF**, rather than hallucinating from general knowledge.

```
User asks a question
        │
        ▼
┌───────────────────┐
│ Generate embedding│  ← OpenAI text-embedding-ada-002
│ for the question  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Vector similarity │  ← Query Pinecone with the question embedding
│ search (Pinecone) │     Returns top-K most relevant PDF chunks
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Build context     │  ← Combine retrieved chunks into a context window
│ from chunks       │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ GPT-4 prompt      │  ← System prompt = context from PDF
│ with context      │     User message = original question
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Streaming answer  │  ← Streamed token-by-token to the browser
│ back to user      │     via Vercel AI SDK
└───────────────────┘
```

### PDF Ingestion Pipeline

```
PDF uploaded by user
        │
        ▼
  Upload to AWS S3
        │
        ▼
  Download from S3 (server-side)
        │
        ▼
  Parse PDF into pages (pdf-parse + LangChain PDFLoader)
        │
        ▼
  Split each page into smaller chunks
  (RecursiveCharacterTextSplitter)
        │
        ▼
  Embed each chunk into a float[] vector
  (OpenAI text-embedding-ada-002, 1536 dimensions)
        │
        ▼
  Upsert vectors into Pinecone
  (namespace = S3 file key)
        │
        ▼
  Save chat record in Neon DB
  Redirect user to /chat/[id]
```

---

## Database Schema

```sql
-- One record per uploaded PDF / chat session
CREATE TABLE chats (
  id          SERIAL PRIMARY KEY,
  pdf_name    TEXT NOT NULL,
  pdf_url     TEXT NOT NULL,
  file_key    TEXT NOT NULL,
  user_id     VARCHAR(256) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Every message exchanged in a chat
CREATE TABLE messages (
  id          SERIAL PRIMARY KEY,
  chat_id     INTEGER REFERENCES chats(id),
  content     TEXT NOT NULL,
  role        ENUM('user', 'assistant', 'system'),
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/            # Streaming GPT-4 chat endpoint
│   │   ├── create-chat/     # PDF ingestion + chat creation
│   │   ├── delete-chat/     # Delete chat + S3 file
│   │   └── get-messages/    # Fetch chat history
│   ├── chat/[chatId]/       # Chat page (PDF viewer + chat UI)
│   └── page.tsx             # Landing page
├── components/
│   ├── ChatLayout.tsx       # Three-panel layout with sidebar toggle
│   ├── ChatSideBar.tsx      # Collapsible sidebar with chat list
│   ├── ChatComponent.tsx    # Chat input + message stream
│   ├── MessageList.tsx      # Rendered message bubbles
│   ├── PDFViewer.tsx        # Google Docs iframe PDF renderer
│   └── FileUplaod.tsx       # Drag-and-drop PDF uploader
└── lib/
    ├── pinecone.ts          # PDF → chunks → embeddings → Pinecone
    ├── embeddings.ts        # OpenAI embedding API wrapper
    ├── context.ts           # Pinecone similarity search
    ├── s3.ts                # S3 upload + URL utilities (client)
    ├── s3-server.ts         # S3 download (server-side)
    └── db/
        ├── index.ts         # Neon DB connection via Drizzle
        └── schema.ts        # chats + messages table definitions
```

---

## Environment Variables

```env
# AWS S3
NEXT_PUBLIC_S3_ACCESS_KEY_ID=
NEXT_PUBLIC_S3_SECRET_ACCESS_KEY=
NEXT_PUBLIC_S3_BUCKET_NAME=

# Pinecone
PINECONE_API_KEY=

# OpenAI
OPENAI_API_KEY=

# Neon Database
DATABASE_URL=

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

Deployed on **Vercel**. Every push to `main` triggers an automatic redeployment.

---

Built by [Vinit Raj Singh](https://github.com/Vinit20762)

# intelliDocs — Chat with any PDF using AI

intelliDocs is an AI-powered SaaS that lets you upload any PDF and have a natural conversation with it. Ask questions, get summaries, and extract insights — all powered by GPT-4 and Retrieval-Augmented Generation (RAG).

> **Live:** [intellidocs.vercel.app](https://intellidocs.vercel.app) &nbsp;·&nbsp; Built by [Vinit Raj Singh](https://github.com/Vinit20762)

---

## Features

### Core
- **PDF Upload** — Drag and drop any PDF (up to 10 MB), stored securely on AWS S3
- **AI Chat** — Ask questions about your PDF in natural language, powered by GPT-4
- **Streaming Responses** — Real-time token-by-token streaming via Vercel AI SDK
- **RAG Pipeline** — Answers are grounded in your document using vector similarity search (Pinecone + OpenAI embeddings)
- **Chat History** — All conversations are persisted in PostgreSQL and accessible from the sidebar
- **Multi-document** — Upload multiple PDFs, each with its own independent chat session
- **Delete Chats** — Permanently removes the chat, messages, and the PDF from S3

### UI / UX
- **Collapsible Sidebar** — Full or icon-only sidebar with smooth transitions (ChatGPT-style)
- **Mobile Responsive** — Dedicated mobile layout with hamburger menu and PDF/Chat toggle
- **AI Thinking Indicator** — Animated bouncing dots while GPT-4 is generating a response
- **PDF Viewer** — Inline PDF viewer alongside the chat panel
- **Toast Notifications** — Upload success, errors, and chat creation feedback

### Access Control & Plans
- **Free Plan** — 3 PDF uploads and 5 messages per document
- **Server-enforced limits** — All limits checked on the API with DB counts (not client-side)
- **Ownership verification** — Every API route verifies the requesting user owns the resource
- **Upgrade Modal** — Premium UI prompt when a limit is reached, with Free vs Pro comparison
- **Pricing Page** — Animated pricing page with monthly/quarterly toggle (Pro plan coming soon)

### Legal & Profile
- **Terms & Conditions** — Full legal page at `/terms`
- **Privacy Policy** — Full legal page at `/privacy`
- **Footer** — Landing page footer with legal links, pricing, and social links

---

## Tech Stack

| Layer | Technology |
|---|---|
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
| Animations | Framer Motion + tw-animate-css |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Next.js)                     │
│                                                             │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────────┐  │
│  │ Sidebar  │   │  PDF Viewer  │   │    Chat Panel      │  │
│  │ (chats)  │   │  (iframe)    │   │  (messages +       │  │
│  │          │   │              │   │   input form)      │  │
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
    │  2. Parse (pdf-parse +  │
    │     LangChain)          │
    │  3. Split into chunks   │
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
  Download from S3 (server-side, written to /tmp)
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
  (namespace = S3 file key, chunked in batches of 10)
        │
        ▼
  Save chat record in Neon DB
  Redirect user to /chat/[id]
```

---

## Security

All limits and access controls are enforced **server-side**:

| Route | Auth | Ownership Check | Limit |
|---|---|---|---|
| `POST /api/create-chat` | ✅ Clerk | ✅ userId from server | ✅ 3 PDFs (DB count) |
| `POST /api/chat` | ✅ Clerk | ✅ chat.userId === userId | ✅ 5 messages (DB count) |
| `POST /api/get-messages` | ✅ Clerk | ✅ chat.userId === userId | — |
| `DELETE /api/delete-chat` | ✅ Clerk | ✅ chat.userId === userId | — |
| `GET /chat/[chatId]` | ✅ Clerk | ✅ redirect if not owner | — |

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
│   │   ├── chat/            # Streaming GPT-4 chat endpoint (auth + ownership + limit)
│   │   ├── create-chat/     # PDF ingestion + chat creation (auth + PDF limit)
│   │   ├── delete-chat/     # Delete chat, messages, and S3 file
│   │   └── get-messages/    # Fetch chat history (auth + ownership)
│   ├── chat/[chatId]/       # Chat page — PDF viewer + chat UI
│   ├── pricing/             # Pricing page (monthly/quarterly toggle)
│   ├── terms/               # Terms & Conditions page
│   ├── privacy/             # Privacy Policy page
│   └── page.tsx             # Landing page with hero + footer
├── components/
│   ├── ChatLayout.tsx       # Three-panel layout (sidebar + PDF + chat)
│   ├── ChatSideBar.tsx      # Collapsible sidebar with chat list + delete
│   ├── ChatComponent.tsx    # Chat input + streaming + message limit UI
│   ├── MessageList.tsx      # Message bubbles + AI thinking indicator
│   ├── PDFViewer.tsx        # Inline PDF renderer (iframe)
│   ├── FileUplaod.tsx       # Drag-and-drop uploader + PDF usage counter
│   ├── UpgradeModal.tsx     # Premium upgrade modal (Free vs Pro comparison)
│   └── ui/
│       ├── button.tsx       # shadcn Button component
│       └── intellidocs-pricing.tsx  # Animated pricing cards component
└── lib/
    ├── pinecone.ts          # PDF → chunks → embeddings → Pinecone upsert
    ├── embeddings.ts        # OpenAI embedding API wrapper
    ├── context.ts           # Pinecone vector similarity search
    ├── s3.ts                # S3 upload + URL helpers (client-side)
    ├── s3-server.ts         # S3 download to /tmp (server-side)
    └── db/
        ├── index.ts         # Neon DB connection via Drizzle ORM
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

Built by [Vinit Raj Singh](https://github.com/Vinit20762) &nbsp;·&nbsp;
[LinkedIn](https://www.linkedin.com/in/vinit-raj-singh-0312b5286/) &nbsp;·&nbsp;
[vinitrajsingh5555@gmail.com](mailto:vinitrajsingh5555@gmail.com)

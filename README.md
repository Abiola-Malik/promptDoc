# PromptDoc

AI-powered documentation and codebase Q&A. Point it at a GitHub repository or upload a ZIP, and PromptDoc indexes your code into a vector database so you can ask questions about it or generate complete Markdown documentation — all grounded in your actual source, not hallucinated.

**Live demo:** _coming soon_
**Blog series:** _coming soon_

---

## What it does

1. **Ingest** — connect a GitHub repository or upload a ZIP of your codebase
2. **Index** — code is chunked, embedded, and stored in a vector database, namespaced per project
3. **Ask** — chat with your codebase using RAG-powered Q&A with multi-query retrieval
4. **Generate** — produce full Markdown documentation via an agentic generate → critique → refine loop

---

## Architecture

PromptDoc is a microservices system: a Next.js frontend acting as the API gateway, and three independent Python services handling the AI pipeline.

```
Browser
  └── Next.js 15 (web/) — UI, Auth, API Gateway
        │
        ├── Appwrite ─────────── Auth (Email + GitHub OAuth), Database, Storage
        │
        ├── /api/ingest ───────► chunk-service (FastAPI)
        │                            └── Redis queue
        │                                  └── embed-worker
        │                                        ├── Voyage AI (embeddings)
        │                                        └── Pinecone (vector storage)
        │
        ├── /api/ingest/status ► embed-service (job progress)
        │
        └── /api/.../chat ─────► rag-service (FastAPI + LangGraph)
                                       ├── Voyage AI (query embedding)
                                       ├── Pinecone (retrieval)
                                       └── Gemini 2.0 Flash (generation, streamed)
```

Each Python service is independently deployable, independently tested, and communicates over HTTP with a shared internal secret. The frontend never talks to Pinecone, Voyage AI, or Gemini directly — every AI call is mediated by its owning service.

### Why microservices for a project this size?

Honestly — because it's the right tool for demonstrating the engineering, and because the constraints are real even at small scale:

- Vercel functions time out at 10 seconds; embedding hundreds of chunks takes longer
- Python's AI ecosystem (LangChain, LangGraph, Voyage AI SDK) is meaningfully better than the JS equivalents
- Async processing genuinely needs a queue — coupling upload latency to embedding latency is bad UX regardless of scale

What I deliberately avoided: Kubernetes, a service mesh, gRPC. Three FastAPI services behind Docker Compose is the right amount of infrastructure for what this needs to do. Reaching for more would be solving a scaling problem I don't have.

---

## Services

### `web/` — Next.js 15 frontend & API gateway

React 19, TypeScript, Tailwind, shadcn/ui. Handles auth (Appwrite, email + GitHub OAuth), the dashboard UI, and proxies all AI requests to the Python services.

### `services/chunk-service/` — ingestion & chunking

Receives a ZIP or GitHub repo reference, extracts supported code files, splits them into structure-aware chunks (function/class boundary detection), and publishes them to a Redis queue.

### `services/embed-service/` — embedding pipeline

A FastAPI API plus a separate worker container. The worker drains chunks from Redis in batches of up to 128, embeds them with Voyage AI's `voyage-code-3` (a code-optimised embedding model), and upserts into Pinecone under a namespace per project. Tracks job progress in Redis for the frontend to poll.

### `services/rag-service/` — retrieval-augmented generation

A LangGraph state machine handling two paths:

- **Q&A** — classify intent → expand query (multi-query + step-back) → parallel Pinecone retrieval → deduplicate → generate streamed answer
- **Documentation generation** — plan outline → draft → critique → refine (up to 2 loops) → finalize

Streams responses token-by-token via Server-Sent Events.

---

## Tech stack

| Layer              | Technology                                                             |
| ------------------ | ---------------------------------------------------------------------- |
| Frontend           | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Auth               | Appwrite Cloud (Email + GitHub OAuth)                                  |
| Database & storage | Appwrite                                                               |
| chunk-service      | Python 3.11, FastAPI, Redis                                            |
| embed-service      | Python 3.11, FastAPI, LangChain, Redis worker                          |
| rag-service        | Python 3.11, FastAPI, LangGraph, LangChain                             |
| Embeddings         | Voyage AI `voyage-code-3` (1024-dim, code-optimised)                   |
| Vector database    | Pinecone (namespace-per-project)                                       |
| LLM                | Google Gemini 2.5 Flash                                                |
| Message queue      | Redis 7                                                                |
| Observability      | LangSmith                                                              |
| Containerisation   | Docker, Docker Compose                                                 |
| CI/CD              | GitHub Actions (per-service pipelines)                                 |
| Deployment         | Vercel (frontend), Railway (Python services + Redis)                   |

---

## Repository structure

```
promptDoc/
├── docker-compose.yml          # orchestrates all services + Redis
├── .env.example                 # documents every variable across the system
├── .github/workflows/           # one CI pipeline per service
│
├── web/                         # Next.js application
│   ├── app/
│   │   ├── api/ingest/          # → chunk-service
│   │   ├── api/ingest/status/   # → embed-service
│   │   ├── api/projects/[id]/chat/  # → rag-service (SSE)
│   │   ├── api/github/          # repo list, file tree, token
│   │   └── dashboard/           # project UI, chat UI
│   ├── features/
│   ├── hooks/
│   └── stores/
│
└── services/
    ├── chunk-service/
    │   ├── app/
    │   ├── tests/
    │   └── Dockerfile
    ├── embed-service/
    │   ├── app/
    │   ├── tests/
    │   └── Dockerfile
    └── rag-service/
        ├── app/
        │   ├── nodes/            # LangGraph node implementations
        │   └── clients/          # Pinecone, Voyage AI, Gemini singletons
        ├── tests/
        └── Dockerfile
```

---

## Getting started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker and Docker Compose
- Accounts (all have free tiers): [Appwrite](https://appwrite.io), [Pinecone](https://pinecone.io), [Voyage AI](https://voyageai.com), [Google AI Studio](https://aistudio.google.com) for Gemini

### Setup

```bash
git clone https://github.com/Abiola-Malik/promptDoc.git
cd promptDoc
```

Copy the example env file and fill in your keys:

```bash
cp .env.example web/.env.local
cp services/chunk-service/.env.example services/chunk-service/.env
cp services/embed-service/.env.example services/embed-service/.env
cp services/rag-service/.env.example services/rag-service/.env
```

Generate a shared internal secret and use the same value in all four `.env` files:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Run with Docker Compose (Python services + Redis)

```bash
docker compose up --build
```

This starts `chunk-service` (port 8001), `embed-service` (port 8002), `embed-worker`, `rag-service` (port 8003), and `redis`.

### Run the frontend

```bash
cd web
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Verify everything is healthy

```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
```

---

## Testing

Each Python service has its own pytest suite:

```bash
cd services/chunk-service && pytest tests/ -v
cd services/embed-service  && pytest tests/ -v
cd services/rag-service    && pytest tests/ -v
```

CI runs automatically on every push that touches a given service's path — see `.github/workflows/`.

---

## Design decisions worth knowing about

**Why Voyage AI over Gemini for embeddings.** `voyage-code-3` is purpose-built for code retrieval and outperforms general-purpose text embedding models on code search benchmarks, while offering a generous free tier (200M tokens/month).

**Why Pinecone over a self-hosted vector DB.** ChromaDB is fully free and would work locally, but Railway's free tier containers are ephemeral — local disk storage gets wiped on restart. Pinecone's hosted free tier survives restarts, which matters for a deployed demo.

**Why multi-query expansion + step-back prompting instead of RAPTOR.** RAPTOR requires building a hierarchical summarisation tree at index time, adding real complexity to the embedding pipeline. Multi-query + step-back gets most of the retrieval quality gain for a fraction of the implementation cost — the right tradeoff at this scale.

**Why bypass `langchain-pinecone`'s async retrieval.** Under concurrent `asyncio.gather()` calls (used for parallel multi-query retrieval), LangChain's async wrapper triggers an `aiohttp` session lifecycle bug (`RuntimeError: Session is closed`). The fix was to call the Voyage AI and Pinecone SDKs directly for retrieval, which handle concurrent async calls correctly.

**Why a hybrid intent classifier instead of a pure AI classifier.** The frontend sends an intent hint based on which UI mode the user selected. The classifier node only overrides that hint when the query text contains explicit signals ("generate documentation", "create docs"). This means zero extra LLM calls in the common case, with AI correction available when the hint and the query clearly disagree.

---

## What I'd do differently

- Add distributed tracing across service boundaries (not just LangSmith inside rag-service)
- Move the embed-worker to a proper task queue library (Celery or rq) instead of a manual Redis polling loop, for built-in retry and dead-letter handling
- Build a proper mobile chat experience — the current redesign deliberately deferred mobile chat navigation to a follow-up pass
- Add rate limiting at the BFF layer before requests reach the Python services

---

## License

See [LICENSE](./LICENSE).

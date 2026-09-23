# Roadmapper

Type what you want to learn and get an interactive learning roadmap: a graph of concepts and their
prerequisites, streamed onto the canvas as the model generates it.

**Live demo:** https://roadmapper-gamma.vercel.app

## How it works

```
prompt ─► FastAPI /generate
            ├─ intent extraction
            ├─ RAG: pgvector cosine search over a curated resource table (top 5)
            ├─ Gemini, prompted to emit one JSON node or edge per line
            └─ each line validated against a Pydantic schema, then streamed over SSE
                          │
                          ▼
          Next.js + React Flow canvas (dagre auto-layout) adds nodes and edges as they arrive
```

- **Streaming structured output.** The model writes JSON Lines (all nodes, then edges). Each line is
  validated and pushed to the client over server-sent events, so the graph builds live instead of
  appearing after a long wait.
- **Grounded resources.** Relevant links from a pgvector-backed resource table are added to the
  prompt, so nodes point to curated material.
- **Saved roadmaps.** Signed-in users (Google OAuth via Auth.js, JWT to the API) can save, list,
  reopen and delete roadmaps.
- **Swappable LLM.** The provider sits behind a factory interface; Gemini is the default.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, React Flow, dagre, Zustand, Framer Motion, Tailwind, Auth.js |
| Backend | FastAPI, async SQLAlchemy, SSE |
| Data | PostgreSQL + pgvector |
| Hosting | Vercel (frontend), Render (backend), Supabase (database) |

## Run locally

```bash
docker compose up --build        # frontend :3000, backend :8000, Postgres + pgvector :5432
```

Or run each part by hand:

```bash
# backend
cd ai-roadmap-builder/backend
cp .env.example .env              # set GEMINI_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload

# frontend
cd ai-roadmap-builder/frontend
cp .env.example .env.local        # set AUTH_SECRET and the Google OAuth credentials
npm install && npm run dev
```

Deployment notes are in [`context/DEPLOYMENT.md`](context/DEPLOYMENT.md).

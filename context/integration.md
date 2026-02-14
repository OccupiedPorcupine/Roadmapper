# Project Specifics: AI Roadmap Builder - Frontend/Backend Integration

**Goal:** Build the communication bridge between the Next.js frontend and the FastAPI backend. This involves managing the global state for the roadmap nodes and using a custom fetch hook to consume Server-Sent Events (SSE) via a POST request.

## 1. The API Contract

The frontend communicates with the backend using the following contract:

- **Endpoint:** `POST /api/generate`
- **Base URL:** Configured via `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`). Set in frontend `.env.local` for local dev or deployment.
- **Headers:**
  - `Content-Type: application/json`
  - `x-user-api-key: <string>` (optional; injected from Zustand store when set in user settings)
- **Request Body:** `{ "query": "string" }`
- **Response:** Server-Sent Events (`text/event-stream`). Each event is a line `data: <JSON>\n\n` where the payload is a JSON object. Supported chunk types:
  - **Node:** `{ "type": "concept", "id": "<string>", "label": "<string>", ... }` — pushed to the roadmap as a node.
  - **Edge:** `{ "type": "edge", "id": "<string>", "source": "<string>", "target": "<string>", ... }` — pushed as an edge between nodes.

**Backend (FastAPI):** CORS is enabled for `http://localhost:3000` and `http://127.0.0.1:3000` so the Next.js dev server can call the API. The `/api/generate` route reads the optional `x-user-api-key` header for future rate-limiting or per-user LLM keys.

## 2. Global State Management (Zustand)

**File:** `ai-roadmap-builder/frontend/src/store/roadmapStore.ts`

**Implemented:**
- **State:**
  - `nodes`: Array of `RoadmapNode` objects.
  - `edges`: Array of `RoadmapEdge` objects.
  - `isGenerating`: Boolean (true while streaming, false when done).
  - `userApiKey`: `string | null`, persisted to `localStorage` via Zustand `persist` (partialized so only `userApiKey` is stored).
- **Actions:**
  - `addNode(node: RoadmapNode)`: Appends a single node.
  - `addEdge(edge: RoadmapEdge)`: Appends a single edge.
  - `setGenerating(status: boolean)`: Sets loading state.
  - `resetRoadmap()`: Clears `nodes` and `edges` for a new query.
  - `setUserApiKey(key: string | null)`: Sets the API key (e.g. from user settings); persisted.

**Types (frontend):** `ai-roadmap-builder/frontend/src/types/index.ts`
- `RoadmapNode`: `{ type: "concept"; id: string; label: string; [key: string]: unknown }`
- `RoadmapEdge`: `{ id: string; source: string; target: string; [key: string]: unknown }`

## 3. The Streaming Client Hook

**File:** `ai-roadmap-builder/frontend/src/hooks/useRoadmapStream.ts`

**Implemented:**
- Uses `@microsoft/fetch-event-source` (no native `EventSource`) so POST and custom headers are supported.
- Hook `useRoadmapStream()` returns `{ generateRoadmap }`.
- `generateRoadmap(query: string)`:
  1. Calls `resetRoadmap()` and `setGenerating(true)`.
  2. Calls `POST ${NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/generate` with `fetchEventSource`.
  3. Headers: `Content-Type: application/json` and `x-user-api-key` when `userApiKey` is set.
  4. **onmessage:** Parses `ev.data` as JSON; if `type === 'concept'` calls `addNode(data)`; if `type === 'edge'` calls `addEdge(data)`.
  5. **onclose:** Calls `setGenerating(false)`.
  6. **onerror:** Calls `setGenerating(false)`, logs rate-limit-style errors, then rethrows to prevent infinite retries.

## 4. Wiring to the UI

**File:** `ai-roadmap-builder/frontend/src/app/page.tsx`

- The landing page uses `useRoadmapStream()` and passes `generateRoadmap` into the hero submit handler.
- When the user submits the hero input (e.g. "Learn React Native"), `handleHeroSubmit` calls `generateRoadmap(value)`, which triggers the SSE request and updates the Zustand store as chunks arrive.

**Optional:** User settings UI can call `useRoadmapStore.getState().setUserApiKey(key)` (or a selector) to set the API key; it is persisted and sent on subsequent `/api/generate` requests.

## 5. Backend Implementation Summary

- **Route:** `POST /api/generate` in `ai-roadmap-builder/backend/app/api/routes.py` (mounted under prefix `/api`).
- **Request:** Body validated with Pydantic `RoadmapRequest(query: str)`; optional header `x-user-api-key`.
- **Streaming:** `StreamingResponse` with `media_type="text/event-stream"`; each chunk from `generate_roadmap_stream(query)` is formatted with `sse_event(chunk)` in `app/services/sse.py` as `data: <json.dumps(chunk)>\n\n`.
- **Schemas:** `app/schemas/roadmap.py` defines `RoadmapRequest`, `RoadmapNodeChunk` (type, id, label), and `RoadmapEdgeChunk` (type, id, source, target) for validation and documentation.
- **Orchestrator:** `app/services/orchestrator.py` exposes `generate_roadmap_stream(query)`; currently yields placeholder concept nodes; can be replaced with full RAG/LLM pipeline yielding same chunk shape.

## 6. Reference: fetchEventSource usage

```typescript
await fetchEventSource(`${apiBaseUrl}/api/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(userApiKey && { 'x-user-api-key': userApiKey })
  },
  body: JSON.stringify({ query }),
  onmessage(ev) {
    const parsedData = JSON.parse(ev.data);
    if (parsedData.type === 'concept') addNode(parsedData);
    if (parsedData.type === 'edge') addEdge(parsedData);
  },
  onclose() { setGenerating(false); },
  onerror(err) {
    setGenerating(false);
    throw err;
  }
});
```

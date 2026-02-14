# Todo: Placeholders to Implement

This file lists all placeholder files and directories created for the **AI Roadmap Builder** project structure. Replace each with real implementation when building the MVP.

---

## Frontend (`ai-roadmap-builder/frontend/`)

### App (Next.js 14 App Router)
| Path | Purpose | Todo |
|------|---------|------|
| `src/app/layout.tsx` | Root layout | Add providers, fonts, global styles (Tailwind), dark theme |
| `src/app/page.tsx` | Landing page | Implement hero (headline, ChatInput, RaycasterBg), nav bar, auth state |

### Components
| Path | Purpose | Todo |
|------|---------|------|
| `src/components/ui/` | shadcn/ui components | Add shadcn, implement `rainbow-button.tsx` (gradient CTA / Sign In) |
| `src/components/ui/rainbow-button.tsx` | Rainbow gradient button | Full styling (blue→cyan→magenta), used for Sign In / CTAs |
| `src/components/features/ChatInput.tsx` | Hero “type anything” input | Glass container, rainbow border, placeholder, submit → trigger SSE |
| `src/components/features/RoadmapCanvas.tsx` | Roadmap graph | React Flow v11 canvas, nodes/edges from streamed roadmap |
| `src/components/features/` | Other feature components | Sidebar drawer, nav bar, auth UI as needed |
| `src/components/canvas/RaycasterBg.tsx` | WebGL background | React Three Fiber / Three.js ray casting cursor effects |

### Hooks
| Path | Purpose | Todo |
|------|---------|------|
| `src/hooks/useSSEStream.ts` | SSE consumption | Connect to backend `/api/.../stream`, parse events, update roadmap state |

### Store
| Path | Purpose | Todo |
|------|---------|------|
| `src/store/roadmapStore.ts` | Global roadmap state | Zustand store: current query, nodes/edges, stream status, history list |

### Types
| Path | Purpose | Todo |
|------|---------|------|
| `src/types/index.ts` | TS data contracts | Define interfaces that mirror Pydantic schemas (RoadmapNode, RoadmapEdge, etc.) |

### Config
| Path | Purpose | Todo |
|------|---------|------|
| `tailwind.config.ts` | Tailwind + animations | Custom animations, theme (dark, fonts), design tokens |
| `package.json` | Dependencies | Add Next.js 14, React, TypeScript, Tailwind, framer-motion, shadcn, Zustand, React Flow v11, R3F/Three.js |

---

## Backend (`ai-roadmap-builder/backend/`)

### API
| Path | Purpose | Todo |
|------|---------|------|
| `app/api/routes.py` | FastAPI routes | Implement `/generate` (or similar) with SSE, `/roadmaps` CRUD if needed, auth |

### Core
| Path | Purpose | Todo |
|------|---------|------|
| `app/core/config.py` | App config | Env vars: DB URL, API keys, feature flags |
| `app/core/database.py` | DB connection | Async SQLAlchemy engine/session, pgvector extension |

### Models
| Path | Purpose | Todo |
|------|---------|------|
| `app/models/roadmap.py` | SQLAlchemy + pgvector | Roadmap (and related) tables, vector column if using RAG embeddings |

### Schemas
| Path | Purpose | Todo |
|------|---------|------|
| `app/schemas/roadmap.py` | Pydantic schemas | Request/response/chunk models; keep in sync with frontend `src/types/` |

### Services
| Path | Purpose | Todo |
|------|---------|------|
| `app/services/orchestrator.py` | RAG + LLM | LangChain or LlamaIndex: RAG retrieval, LLM call, stream roadmap chunks |
| `app/services/sse.py` | SSE helpers | Format and yield SSE events for streaming endpoint |

### Root
| Path | Purpose | Todo |
|------|---------|------|
| `main.py` | FastAPI app | Wire routers, CORS, lifespan (DB connect/disconnect) |
| `requirements.txt` | Python deps | Pin FastAPI, SQLAlchemy, pgvector, LangChain/LlamaIndex, etc. |

---

## Cross-cutting

- **Strict typing:** No `any` in TS; Pydantic schemas mirror TS interfaces.
- **One chunk at a time:** Implement one placeholder (or one feature) before moving to the next.
- **No placeholders in production:** Replace every entry in this file with complete, functional code before release.

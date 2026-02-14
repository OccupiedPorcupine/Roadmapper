# AI generation pipeline: intent → resource gathering → prompt → LLM stream → validated SSE
import json
import re
from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.roadmap import EdgeSchema, NodeSchema
from app.services.llm import get_llm_service
from app.services.rag import search_resources

# Prompt that forces JSON-lines output: one object per line, each either a node or an edge
# Braces in JSON examples are escaped ({{ }}) so .format() only substitutes {resource_context}.
ROADMAP_SYSTEM_PROMPT_TEMPLATE = """You are an expert learning-path designer. Given a topic or goal, you produce a structured learning roadmap as a directed graph of concepts (nodes) and dependencies (edges).

Output rules (strict):
- Emit exactly one JSON object per line (no other text).
- Each line must be either a NODE or an EDGE.

NODE format (one JSON object per line):
{{"id": "unique-id", "type": "concept", "position": {{"x": number, "y": number}}, "data": {{"label": "Concept name", "description": "optional short description", "resources": ["url1", "url2"]}}}}
- Use unique ids (e.g. "concept-1", "concept-2").
- Position x,y can be incremental (e.g. 0,0 then 250,0 then 500,0 for rows).
- data.label is required; description and resources are optional.

EDGE format (one JSON object per line):
{{"id": "edge-id", "source": "source-node-id", "target": "target-node-id"}}
- source and target must be node ids you already emitted.

Order: emit all NODES first (so each node is defined before any edge references it), then emit EDGEs. Include 5-15 nodes for a typical roadmap. Cover the key subtopics and prerequisites.

Context from knowledge base (use to enrich labels/descriptions/resources if relevant):
{resource_context}
"""


def _extract_intent(query: str) -> str:
    """Simple intent extraction: normalize and shorten for context."""
    s = query.strip().lower()
    s = re.sub(r"\s+", " ", s)[:500]
    return s or "general learning path"


def _format_resource_context(resources: list) -> str:
    if not resources:
        return "(No additional resources provided.)"
    parts = []
    for r in resources:
        parts.append(f"- {getattr(r, 'title', '')}: {getattr(r, 'url', '')}\n  {getattr(r, 'content_summary', '')[:200]}")
    return "\n".join(parts)


async def _gather_resources(db: AsyncSession, query: str) -> list:
    """Internal RAG + optional external. For MVP we skip vector search if no embedding."""
    query_embedding: list[float] = []  # TODO: call embedding API (e.g. Gemini embed) when available
    return await search_resources(db, query_embedding)


async def generate_roadmap_stream(
    query: str,
    db: AsyncSession,
) -> AsyncIterator[dict]:
    """
    Run the full pipeline and yield validated SSE payloads.
    Each yielded dict is the JSON-serializable event body (e.g. {"type": "concept", ...}).
    """
    intent = _extract_intent(query)
    try:
        resources = await _gather_resources(db, query)
    except Exception:
        resources = []
    resource_context = _format_resource_context(resources)

    system_prompt = ROADMAP_SYSTEM_PROMPT_TEMPLATE.format(
        resource_context=resource_context
    )
    user_content = f"Create a learning roadmap for this topic or goal:\n\n{query}"

    llm = get_llm_service()
    buffer = ""

    async for chunk in llm.generate_stream(system_prompt, user_content):
        buffer += chunk
        # Try to complete lines and parse each line as JSON
        while "\n" in buffer:
            line, buffer = buffer.split("\n", 1)
            line = line.strip()
            if not line:
                continue
            # Strip possible markdown code fence
            if line.startswith("```"):
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(obj, dict):
                continue
            # Validate and yield as node or edge
            try:
                if obj.get("type") == "concept" and "id" in obj and "data" in obj:
                    node = NodeSchema(
                        id=obj["id"],
                        type=obj.get("type", "concept"),
                        position=obj.get("position", {"x": 0, "y": 0}),
                        data=obj.get("data", {"label": ""}),
                    )
                    yield node.to_sse_payload()
                elif "source" in obj and "target" in obj and "id" in obj:
                    edge = EdgeSchema(
                        id=obj["id"],
                        source=obj["source"],
                        target=obj["target"],
                        source_handle=obj.get("source_handle"),
                        target_handle=obj.get("target_handle"),
                    )
                    yield {"type": "edge", **edge.model_dump(mode="json")}
            except Exception:
                continue

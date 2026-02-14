# Pydantic v2 schemas for roadmap nodes/edges and API (mirror frontend contracts)
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


# --- React Flow node: backend is source of truth ---
class PositionSchema(BaseModel):
    x: float = 0.0
    y: float = 0.0


class NodeDataSchema(BaseModel):
    label: str = ""
    """Human-readable concept/topic label."""
    description: str | None = None
    """Optional short description."""
    resources: list[str] = Field(default_factory=list)
    """Optional URLs or resource hints."""


class NodeSchema(BaseModel):
    """A single roadmap node. Streamed as type='concept' for frontend."""
    id: str
    type: str = "concept"
    position: PositionSchema = Field(default_factory=PositionSchema)
    data: NodeDataSchema = Field(default_factory=NodeDataSchema)

    def to_sse_payload(self) -> dict[str, Any]:
        """Payload sent in SSE; frontend checks type === 'concept' and addNode(payload)."""
        return self.model_dump(mode="json")


# --- Edge (connection between nodes) ---
class EdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    source_handle: str | None = None
    target_handle: str | None = None


# --- API request/response ---
class GenerateRequestSchema(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)


class RoadmapListItemSchema(BaseModel):
    id: str
    title: str
    created_at: str

    class Config:
        from_attributes = True


class RoadmapFullSchema(BaseModel):
    id: str
    title: str
    topic_query: str
    nodes: list[dict[str, Any]] = Field(default_factory=list)
    edges: list[dict[str, Any]] = Field(default_factory=list)
    created_at: str

    class Config:
        from_attributes = True


class RoadmapUpdateSchema(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=512)
    nodes: list[dict[str, Any]] | None = None
    edges: list[dict[str, Any]] | None = None


class RoadmapCreateSchema(BaseModel):
    title: str = Field(..., min_length=1, max_length=512)
    topic_query: str = Field(..., max_length=2000)
    nodes: list[dict[str, Any]] = Field(default_factory=list)
    edges: list[dict[str, Any]] = Field(default_factory=list)

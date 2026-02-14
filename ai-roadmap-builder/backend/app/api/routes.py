# FastAPI route definitions: auth, roadmaps, generate (SSE)
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_optional
from app.core.database import get_db, async_session_factory
from app.core.security import create_access_token
from app.models import Roadmap, User
from app.schemas.auth import LoginRequestSchema, TokenResponseSchema
from app.schemas.roadmap import (
    GenerateRequestSchema,
    RoadmapCreateSchema,
    RoadmapFullSchema,
    RoadmapListItemSchema,
    RoadmapUpdateSchema,
)
from app.services.orchestrator import generate_roadmap_stream
from app.services.sse import sse_event

router = APIRouter()


# --- Auth ---
@router.post("/auth/login", response_model=TokenResponseSchema)
async def login(
    body: LoginRequestSchema,
    db: AsyncSession = Depends(get_db),
) -> TokenResponseSchema:
    """Issue JWT for the given email. Creates user if not exists."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(email=body.email)
        db.add(user)
        await db.flush()
    token = create_access_token(str(user.id), user.email)
    return TokenResponseSchema(access_token=token)


# --- Roadmaps (authenticated) ---
@router.get("/roadmaps", response_model=list[RoadmapListItemSchema])
async def list_roadmaps(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[RoadmapListItemSchema]:
    """Fetch all roadmap titles and IDs for the authenticated user."""
    result = await db.execute(
        select(Roadmap).where(Roadmap.user_id == user.id).order_by(Roadmap.created_at.desc())
    )
    roadmaps = result.scalars().all()
    return [
        RoadmapListItemSchema(
            id=str(r.id),
            title=r.title,
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in roadmaps
    ]


@router.get("/roadmaps/{roadmap_id}", response_model=RoadmapFullSchema)
async def get_roadmap(
    roadmap_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RoadmapFullSchema:
    """Fetch full roadmap (nodes/edges) for a specific id. Must belong to user."""
    result = await db.execute(
        select(Roadmap).where(
            Roadmap.id == roadmap_id,
            Roadmap.user_id == user.id,
        )
    )
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found",
        )
    return RoadmapFullSchema(
        id=str(roadmap.id),
        title=roadmap.title,
        topic_query=roadmap.topic_query,
        nodes=roadmap.nodes or [],
        edges=roadmap.edges or [],
        created_at=roadmap.created_at.isoformat() if roadmap.created_at else "",
    )


@router.post("/roadmaps", response_model=RoadmapFullSchema)
async def create_roadmap(
    body: RoadmapCreateSchema,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RoadmapFullSchema:
    """Create a new roadmap manually (e.g. saving an anonymous generation)."""
    roadmap = Roadmap(
        user_id=user.id,
        title=body.title,
        topic_query=body.topic_query,
        nodes=body.nodes,
        edges=body.edges,
    )
    db.add(roadmap)
    await db.commit()
    await db.refresh(roadmap)

    return RoadmapFullSchema(
        id=str(roadmap.id),
        title=roadmap.title,
        topic_query=roadmap.topic_query,
        nodes=roadmap.nodes or [],
        edges=roadmap.edges or [],
        created_at=roadmap.created_at.isoformat() if roadmap.created_at else "",
    )


@router.patch("/roadmaps/{roadmap_id}", response_model=RoadmapFullSchema)
async def update_roadmap(
    roadmap_id: uuid.UUID,
    body: RoadmapUpdateSchema,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RoadmapFullSchema:
    """Update roadmap title, nodes, or edges. Must belong to user."""
    result = await db.execute(
        select(Roadmap).where(
            Roadmap.id == roadmap_id,
            Roadmap.user_id == user.id,
        )
    )
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found",
        )

    if body.title is not None:
        roadmap.title = body.title
    if body.nodes is not None:
        roadmap.nodes = body.nodes
    if body.edges is not None:
        roadmap.edges = body.edges

    db.add(roadmap)
    await db.commit()
    await db.refresh(roadmap)

    return RoadmapFullSchema(
        id=str(roadmap.id),
        title=roadmap.title,
        topic_query=roadmap.topic_query,
        nodes=roadmap.nodes or [],
        edges=roadmap.edges or [],
        created_at=roadmap.created_at.isoformat() if roadmap.created_at else "",
    )


@router.delete("/roadmaps/{roadmap_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap(
    roadmap_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    """Delete a roadmap. Must belong to user."""
    result = await db.execute(
        select(Roadmap).where(
            Roadmap.id == roadmap_id,
            Roadmap.user_id == user.id,
        )
    )
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roadmap not found",
        )

    await db.delete(roadmap)
    await db.commit()


# --- Generate (SSE); optional auth (if present, save roadmap when stream ends) ---
async def _stream_and_optionally_save(
    query: str,
    db: AsyncSession,
    user: User | None,
) -> Any:
    collected_nodes: list[dict[str, Any]] = []
    collected_edges: list[dict[str, Any]] = []
    async for event in generate_roadmap_stream(query, db):
        if event.get("type") == "concept":
            collected_nodes.append(event)
        elif event.get("type") == "edge":
            collected_edges.append(
                {
                    "id": event.get("id"),
                    "source": event.get("source"),
                    "target": event.get("target"),
                    "source_handle": event.get("source_handle"),
                    "target_handle": event.get("target_handle"),
                }
            )
        yield sse_event(event)
    if user and collected_nodes:
        title = query[:200].strip() or "Untitled Roadmap"
        roadmap = Roadmap(
            user_id=user.id,
            title=title,
            topic_query=query,
            nodes=collected_nodes,
            edges=collected_edges,
        )
        async with async_session_factory() as save_session:
            save_session.add(roadmap)
            await save_session.commit()
            await save_session.refresh(roadmap)
            yield sse_event({"type": "meta", "id": str(roadmap.id)})


@router.post("/generate")
async def generate(
    body: GenerateRequestSchema,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
) -> StreamingResponse:
    """Stream a new roadmap as SSE. If authenticated, save the roadmap when stream ends."""
    return StreamingResponse(
        _stream_and_optionally_save(body.query, db, user),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

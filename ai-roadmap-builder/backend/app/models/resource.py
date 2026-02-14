# Resource model with pgvector embedding for RAG
import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

# Embedding dimension (e.g. Gemini text-embedding or similar; adjust to your embedder)
EMBEDDING_DIM = 768


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    content_summary: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(
        Vector(EMBEDDING_DIM), nullable=True
    )

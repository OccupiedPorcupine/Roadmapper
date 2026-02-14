# RAG: vector similarity search on resources table
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.resource import Resource

# Limit and dimension must match Resource.embedding
TOP_K = 5


async def search_resources(
    db: AsyncSession,
    query_embedding: list[float],
    top_k: int = TOP_K,
) -> list[Resource]:
    """Return resources whose embedding is closest to query_embedding (cosine distance)."""
    if not query_embedding:
        return []
    # pgvector cosine distance operator <=>
    stmt = (
        select(Resource)
        .where(Resource.embedding.isnot(None))
        .order_by(Resource.embedding.cosine_distance(query_embedding))
        .limit(top_k)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())

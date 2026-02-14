# FastAPI dependencies: DB session, current user from JWT
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, APIKeyHeader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import User

http_bearer = HTTPBearer(auto_error=False)
optional_api_key = APIKeyHeader(name="x-user-api-key", auto_error=False)


async def get_current_user_optional(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer),
    api_key: str | None = Depends(optional_api_key),
) -> User | None:
    """Resolve user from JWT or x-user-api-key (treat api_key as token). Returns None if no auth."""
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif api_key:
        token = api_key
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    
    # Sync user from token to DB
    # We trust the email from the token because it's signed by our shared secret (via NextAuth)
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        user = User(
            email=payload.email,
            # full_name and picture might not be in the minimal payload, 
            # but usually NextAuth JWT has name/picture. 
            # We'd need to update TokenPayloadSchema to include them to extract them here.
            # For now, create with email.
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    return user


async def get_current_user(
    user: User | None = Depends(get_current_user_optional),
) -> User:
    """Require authenticated user; raise 401 if missing."""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

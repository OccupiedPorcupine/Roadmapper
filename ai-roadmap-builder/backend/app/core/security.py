# JWT creation and validation
from datetime import datetime, timezone, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.schemas.auth import TokenPayloadSchema

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(sub: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": sub,
        "email": email,
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> TokenPayloadSchema | None:
    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        return TokenPayloadSchema(
            sub=payload["sub"],
            email=payload["email"],
            exp=payload["exp"],
            iat=payload["iat"],
        )
    except (JWTError, KeyError):
        return None


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

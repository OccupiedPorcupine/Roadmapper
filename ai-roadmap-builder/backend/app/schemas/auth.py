# Auth: login request/response and JWT payload
from pydantic import BaseModel, EmailStr, Field


class LoginRequestSchema(BaseModel):
    email: EmailStr


class TokenResponseSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayloadSchema(BaseModel):
    sub: str  # user id (UUID string)
    email: str
    exp: int
    iat: int

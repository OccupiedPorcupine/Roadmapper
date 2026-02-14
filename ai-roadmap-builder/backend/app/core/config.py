# App config: env, DB URL, JWT, API keys
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI Roadmap Builder"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/roadmapper"

    # Auth (Shared Secret with NextAuth)
    auth_secret: str = "change-me-in-production-use-env"
    jwt_algorithm: str = "HS256"

    # LLM (Gemini by default)
    gemini_api_key: str = ""
    llm_provider: str = "gemini"  # used by LLMFactory

    # Optional: external resources
    youtube_api_key: str | None = None
    web_search_api_key: str | None = None

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

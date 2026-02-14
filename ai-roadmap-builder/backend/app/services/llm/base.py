# Abstract base class: contract all LLM implementations must follow
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator


class BaseLLMService(ABC):
    """Interface for LLM providers. Implementations must support streaming structured output."""

    @abstractmethod
    async def generate_stream(
        self,
        system_prompt: str,
        user_content: str,
    ) -> AsyncIterator[str]:
        """
        Stream raw text chunks from the model (e.g. JSON lines or SSE-friendly chunks).
        Caller is responsible for parsing and validating against Node/Edge schemas.
        """
        ...

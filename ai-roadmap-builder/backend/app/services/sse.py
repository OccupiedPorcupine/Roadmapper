# SSE response helpers for streaming roadmap to frontend
import json


def sse_event(data: dict) -> str:
    """Format a dict as one SSE event (data line + double newline)."""
    return f"data: {json.dumps(data)}\n\n"

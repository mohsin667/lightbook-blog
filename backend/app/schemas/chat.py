from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=500)
    # Slugs of the posts the previous answer was based on, if any — lets a
    # genuine follow-up ("who wrote it?") that has no independent topical
    # match fall back to the post(s) already being discussed, instead of
    # incorrectly refusing. Capped at 5 defensively; the frontend only ever
    # sends what it actually received as sources, which is already small.
    previous_sources: list[str] = Field(default_factory=list, max_length=5)


class ChatSource(BaseModel):
    title: str
    slug: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[ChatSource]
    suggestions: list[str] = []

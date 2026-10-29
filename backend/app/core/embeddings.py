import hashlib
import logging

from langchain_cloudflare import CloudflareWorkersAIEmbeddings

from app.core.config import settings

logger = logging.getLogger(__name__)

embedder = CloudflareWorkersAIEmbeddings(
    account_id=settings.cloudflare_account_id,
    api_token=settings.cloudflare_api_token,
    model_name=settings.workers_ai_embedding_model,
)

def content_hash(title: str, content: str, extra: str = "") -> str:
    """Fingerprint of a post's meaning-relevant text. Used to skip re-embedding
     when a save didn't actually change title/content/extra (extra covers
     category name + cover image caption, so a category change or a new
     cover image also triggers a re-embed)."""

    return hashlib.sha256(f"{title}\n\n{content}\n\n{extra}".encode("utf-8")).hexdigest()

def build_embed_input(title: str, content: str, category_name: str = "", cover_caption: str | None = None) -> tuple[str, str]:
    """Returns (embed_input, extra). The cover caption goes at the FRONT with
    a label, not appended after the body — on a long post a trailing
    one-sentence caption barely moves the vector, so image-describing
    questions ("the post with the red 9 3/4 sign") never matched. `extra` is
    what content_hash() should be given so the hash tracks the same text."""
    extra_parts = []
    if category_name:
        extra_parts.append(f"Category: {category_name}")
    if cover_caption:
        extra_parts.append(f"Cover image: {cover_caption}")
    extra = "\n".join(extra_parts)
    head = f"{title}\n{extra}" if extra else title
    return f"{head}\n\n{content}", extra

def embed_text(text: str) -> list[float] | None:
    """Call Cloudflare Workers AI to embed text. Never raises — returns
    None on failure so a flaky embeddings call can't block saving or
    publishing a post."""

    try:
        return embedder.embed_query(text)
    except Exception:
        logger.exception("Failed to generate embedding via Cloudflare Workers AI")
        return None
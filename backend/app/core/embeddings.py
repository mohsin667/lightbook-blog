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

def content_hash(title: str, content: str) -> str:
    """Fingerprint of a post's meaning-relevant text. Used to skip re-embedding
     when  a save didn't actually change  title/content."""

    return hashlib.sha256(f"{title}\n\n{content}".encode("utf-8")).hexdigest()

def embed_text(text: str) -> list[float] | None:
    """Call Cloudflare Workers AI to embed text. Never raises — returns
    None on failure so a flaky embeddings call can't block saving or
    publishing a post."""

    try:
        return embedder.embed_query(text)
    except Exception:
        logger.exception("Failed to generate embedding via Cloudflare Workers AI")
        return None
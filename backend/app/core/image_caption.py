import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Cloudflare Workers AI doesn't wrap vision (image-to-text) models in
# langchain_cloudflare the way it does embeddings/chat, so this calls the
# REST API directly — same base URL pattern langchain_cloudflare itself
# uses under the hood for the other two models.
_INFERENCE_URL = (
    f"https://api.cloudflare.com/client/v4/accounts/{settings.cloudflare_account_id}"
    f"/ai/run/{settings.workers_ai_vision_model}"
)
_HEADERS = {"Authorization": f"Bearer {settings.cloudflare_api_token}"}

# Generous but bounded — a vision model call is slower than a text embed,
# and this runs synchronously inside a post save/publish request. Never
# let a slow/hung Cloudflare call block that indefinitely.
_TIMEOUT_SECONDS = 20.0


def caption_image(image_url: str) -> str | None:
    """Fetches the image at `image_url` and asks a vision model to describe
    it in one short sentence. Never raises — returns None on any failure
    (fetch, API call, unexpected response shape) so a flaky caption call
    can't block or crash a post save."""
    try:
        image_response = httpx.get(image_url, timeout=_TIMEOUT_SECONDS)
        image_response.raise_for_status()
        image_bytes = list(image_response.content)

        caption_response = httpx.post(
            _INFERENCE_URL,
            headers=_HEADERS,
            json={
                "image": image_bytes,
                "prompt": "Describe this image in one concise sentence, as a plain "
                "factual caption for a blog post's cover image.",
                "max_tokens": 100,
            },
            timeout=_TIMEOUT_SECONDS,
        )
        caption_response.raise_for_status()
        description = caption_response.json().get("result", {}).get("description")
        return description.strip() if description else None
    except Exception:
        logger.exception("Failed to caption cover image via Cloudflare Workers AI")
        return None

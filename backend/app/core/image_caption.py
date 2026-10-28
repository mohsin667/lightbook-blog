import io
import logging

import httpx
from PIL import Image

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

# Cover images are unoptimized author uploads (a phone photo can be several
# MB) — sent as a raw JSON array of bytes, that easily exceeds Cloudflare's
# request size limit (a real 413 seen in practice on this app's own
# images). The vision model doesn't need full resolution to caption a
# scene, so downscale/recompress before sending — this keeps every request
# small regardless of how large the original upload was.
_MAX_DIMENSION = 768
_JPEG_QUALITY = 80


def _resize_for_captioning(raw_bytes: bytes) -> bytes:
    """Downscales to at most _MAX_DIMENSION on the long edge and
    re-encodes as JPEG, so the payload sent to Cloudflare stays small no
    matter how large the original upload was."""
    image = Image.open(io.BytesIO(raw_bytes))
    image = image.convert("RGB")
    image.thumbnail((_MAX_DIMENSION, _MAX_DIMENSION))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=_JPEG_QUALITY)
    return buffer.getvalue()


def caption_image(image_url: str) -> str | None:
    """Fetches the image at `image_url` and asks a vision model to describe
    it in one short sentence. Never raises — returns None on any failure
    (fetch, API call, unexpected response shape) so a flaky caption call
    can't block or crash a post save."""
    try:
        image_response = httpx.get(image_url, timeout=_TIMEOUT_SECONDS)
        image_response.raise_for_status()
        resized_bytes = _resize_for_captioning(image_response.content)
        image_bytes = list(resized_bytes)

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

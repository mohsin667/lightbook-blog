import logging

from langchain_cloudflare import ChatCloudflareWorkersAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import settings

logger = logging.getLogger(__name__)

_llm = ChatCloudflareWorkersAI(
    account_id=settings.cloudflare_account_id,
    api_token=settings.cloudflare_api_token,
    model=settings.workers_ai_chat_model,
)

# Unlike chat_llm.py, this is pure generation, not retrieval-grounded — the
# model is writing new content from a title, not answering from existing
# posts. lightbook is a general-purpose platform, so the prompt stays
# topic-agnostic rather than assuming any subject.
SYSTEM_PROMPT = """You are a blog writing assistant for lightbook (lightbook.blog), a \
general-purpose blog platform where authors write about any topic they choose.

Given a post title, write a complete, well-structured draft blog post body in Markdown \
(use ## and ### for headings, **bold** for emphasis, and a blank line between paragraphs), \
plus a one-sentence excerpt summarizing it. Write substantive, original content that actually \
develops the title's topic — do not pad with filler or just restate the title.

Never generate content that is hateful, harassing, sexually explicit, promotes violence or \
self-harm, or gives instructions for illegal activity or weapons. If the title requests \
something like that, respond with exactly: REFUSED: <one short reason>

Otherwise, respond in exactly this format and nothing else:
EXCERPT: <one sentence>
CONTENT:
<the full markdown post body>"""


def generate_post_draft(title: str) -> dict | None:
    """Calls Cloudflare Workers AI to draft a post body + excerpt from a
    title. Returns {"content": str, "excerpt": str}, or
    {"refused": True, "reason": str} if the model declined the title, or
    None on a technical failure (never raises)."""
    try:
        response = _llm.invoke([
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=f'Title: "{title}"'),
        ])
        text = response.content.strip()

        if text.startswith("REFUSED:"):
            return {"refused": True, "reason": text.removeprefix("REFUSED:").strip()}

        if "CONTENT:" not in text:
            # Model didn't follow the format — fall back to treating the
            # whole response as content rather than losing it entirely.
            return {"excerpt": "", "content": text}

        excerpt_part, content_part = text.split("CONTENT:", 1)
        excerpt = excerpt_part.replace("EXCERPT:", "").strip()
        content = content_part.strip()
        return {"excerpt": excerpt, "content": content}
    except Exception:
        logger.exception("Failed to generate post draft via Cloudflare Workers AI")
        return None

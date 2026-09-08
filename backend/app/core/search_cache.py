import threading
import time
from typing import Callable, Generic, TypeVar

T = TypeVar("T")


class _TTLCache(Generic[T]):
    """A short-TTL cache with in-flight de-duplication: if two callers ask
    for the same key while it's already being computed, only one of them
    actually runs the (expensive, external-API-calling) function — the
    other waits for that result instead of duplicating the call."""

    def __init__(self, ttl_seconds: int):
        self._ttl_seconds = ttl_seconds
        self._store: dict[str, tuple[float, T]] = {}
        self._lock = threading.Lock()
        self._in_flight: dict[str, threading.Event] = {}

    def _get(self, key: str) -> T | None:
        entry = self._store.get(key)
        if not entry:
            return None
        cached_at, value = entry
        if time.time() - cached_at > self._ttl_seconds:
            self._store.pop(key, None)
            return None
        return value

    def get_or_compute(self, key: str, compute_fn: Callable[[], T | None]) -> T | None:
        cached = self._get(key)
        if cached is not None:
            return cached

        with self._lock:
            event = self._in_flight.get(key)
            if event is None:
                event = threading.Event()
                self._in_flight[key] = event
                is_leader = True
            else:
                is_leader = False

        if not is_leader:
            event.wait(timeout=15)
            return self._get(key)

        try:
            value = compute_fn()
            if value is not None:
                self._store[key] = (time.time(), value)
            return value
        finally:
            with self._lock:
                self._in_flight.pop(key, None)
            event.set()


# Caches a search QUERY's embedding (not post embeddings) so identical/
# near-identical searches within the TTL window skip the Cloudflare call.
_query_embedding_cache: _TTLCache[list[float]] = _TTLCache(ttl_seconds=300)

# Caches a chat QUESTION's generated answer — LLM generation is the most
# expensive call in this app, so identical questions asked repeatedly (a
# very likely pattern for an FAQ-style chat widget) don't re-run it.
_chat_answer_cache: _TTLCache[dict] = _TTLCache(ttl_seconds=300)

# Simple sliding-window rate limit, keyed per (namespace, user-or-IP). Kept
# per-namespace so a burst of searches can't eat into the (more expensive)
# chat budget or vice versa. In-memory, so this resets on backend restart
# and only works if uvicorn runs a single worker process — fine at this
# project's scale, but would need a shared store (e.g. Redis) behind
# multiple workers.
_RATE_LIMIT_WINDOW_SECONDS = 60
_rate_limits: dict[str, int] = {"search": 20, "chat": 10, "generate": 5}
_rate_buckets: dict[str, list[float]] = {}
_rate_lock = threading.Lock()


def get_or_embed_query(query: str, embed_fn: Callable[[str], list[float] | None]) -> list[float] | None:
    """Returns the embedding for a search query, using a short-TTL cache and
    de-duplicating concurrent identical requests."""
    key = query.strip().lower()
    return _query_embedding_cache.get_or_compute(key, lambda: embed_fn(query))


def get_or_generate_chat_answer(question: str, generate_fn: Callable[[], dict | None]) -> dict | None:
    """Returns a cached chat answer (a dict of {answer, sources}) for an
    identical question, or computes and caches a new one via `generate_fn`."""
    key = question.strip().lower()
    return _chat_answer_cache.get_or_compute(key, generate_fn)


def check_rate_limit(identity_key: str, namespace: str = "search") -> bool:
    """Returns False if `identity_key` (a user ID or IP) has made too many
    requests in `namespace` (e.g. "search" or "chat") in the current window."""
    now = time.time()
    bucket_key = f"{namespace}:{identity_key}"
    max_requests = _rate_limits.get(namespace, 20)
    with _rate_lock:
        timestamps = _rate_buckets.setdefault(bucket_key, [])
        timestamps[:] = [t for t in timestamps if now - t < _RATE_LIMIT_WINDOW_SECONDS]
        if len(timestamps) >= max_requests:
            return False
        timestamps.append(now)
        return True

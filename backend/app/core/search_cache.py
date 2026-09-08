import threading
import time
from typing import Callable

# Caches a QUERY's embedding (not post embeddings) so identical/near-identical
# searches within the TTL window skip the Cloudflare Workers AI call entirely.
_CACHE_TTL_SECONDS = 300  # 5 minutes
_QUERY_CACHE: dict[str, tuple[float, list[float]]] = {}
_lock = threading.Lock()
_in_flight: dict[str, threading.Event] = {}

# Simple sliding-window rate limit, keyed per user (or per IP for anonymous
# visitors). In-memory, so this resets on backend restart and only works if
# uvicorn runs a single worker process — fine at this project's scale, but
# would need a shared store (e.g. Redis) behind multiple workers.
_RATE_LIMIT_WINDOW_SECONDS = 60
_RATE_LIMIT_MAX_REQUESTS = 20
_rate_buckets: dict[str, list[float]] = {}
_rate_lock = threading.Lock()


def _get_cached(query: str) -> list[float] | None:
    entry = _QUERY_CACHE.get(query)
    if not entry:
        return None
    cached_at, vector = entry
    if time.time() - cached_at > _CACHE_TTL_SECONDS:
        _QUERY_CACHE.pop(query, None)
        return None
    return vector


def get_or_embed_query(query: str, embed_fn: Callable[[str], list[float] | None]) -> list[float] | None:
    """Returns the embedding for a search query, using a short-TTL cache and
    de-duplicating concurrent identical requests (only one of N simultaneous
    searches for the same term actually calls the embeddings API — the rest
    wait for that result instead of each making their own call)."""
    key = query.strip().lower()

    cached = _get_cached(key)
    if cached is not None:
        return cached

    with _lock:
        event = _in_flight.get(key)
        if event is None:
            event = threading.Event()
            _in_flight[key] = event
            is_leader = True
        else:
            is_leader = False

    if not is_leader:
        # Someone else is already embedding this exact query — wait for them
        # instead of making a duplicate call.
        event.wait(timeout=10)
        return _get_cached(key)

    try:
        vector = embed_fn(query)
        if vector is not None:
            _QUERY_CACHE[key] = (time.time(), vector)
        return vector
    finally:
        with _lock:
            _in_flight.pop(key, None)
        event.set()


def check_rate_limit(identity_key: str) -> bool:
    """Returns False if `identity_key` (a user ID or IP) has made too many
    semantic search requests in the current window."""
    now = time.time()
    with _rate_lock:
        timestamps = _rate_buckets.setdefault(identity_key, [])
        timestamps[:] = [t for t in timestamps if now - t < _RATE_LIMIT_WINDOW_SECONDS]
        if len(timestamps) >= _RATE_LIMIT_MAX_REQUESTS:
            return False
        timestamps.append(now)
        return True

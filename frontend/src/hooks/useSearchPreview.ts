import { useEffect, useState } from 'react';
import refreshAPI from '../api/refreshAPI';
import type { Post } from '../types';

const PREVIEW_LIMIT = 5;
const DEBOUNCE_MS = 300;

export function useSearchPreview(query: string) {
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        // /api/search/semantic already falls back to keyword search
        // server-side if the Cloudflare embeddings call fails or the daily
        // Neuron quota is exhausted — so we only ever call one endpoint
        // here, not both.
        const res = await refreshAPI(`/api/search/semantic?q=${encodeURIComponent(trimmed)}&limit=${PREVIEW_LIMIT}`);
        setResults(res.ok ? await res.json() : []);
      } catch {
        setResults([]); // network hiccup — dropdown just shows "no results" rather than erroring
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer); // this is the actual debounce: reset the timer on every keystroke
  }, [query]);

  return { results, loading };
}

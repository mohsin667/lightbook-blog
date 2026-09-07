// Formatting helpers for the API's shapes: ISO-8601 timestamp strings and
// the server-computed `read_time_minutes`.

const DAY_MS = 86400000;

export function formatReadTime(minutes: number): string {
  return `${Math.max(1, minutes || 1)} min read`;
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return 'unknown';

  const days = Math.floor((Date.now() - ts) / DAY_MS);
  if (days < 1) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return '—';
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export interface AvatarProps {
  /** A display name — initials are derived from it. */
  user: string | null | undefined;
  size?: number;
}

function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ user, size = 32 }: AvatarProps) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-display font-bold flex-shrink-0 bg-surface-tint text-ink"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initialsOf(user)}
    </div>
  );
}

// import type { User } from '../../data/mockData';
export interface AvatarProps {
  user: string | null;
  size?: number;
}

// export function Avatar({ user, size = 32 }: AvatarProps) {
export function Avatar({ user, size = 32 }: AvatarProps) {
  const initials = user && typeof user === 'string' ? user.split(' ') : '?';
  console.log(initials, "initials in avatar")
  return (
    <div
      className="rounded-full flex items-center justify-center font-display font-bold flex-shrink-0 bg-surface-tint text-ink"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initials.length > 1 ? initials[0][0] + initials[1][0] : initials[0][0]}
    </div>
  );
}

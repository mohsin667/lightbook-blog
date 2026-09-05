import type { User } from '../../data/mockData';

export interface AvatarProps {
  user: Pick<User, 'name'>;
  size?: number;
}

// export function Avatar({ user, size = 32 }: AvatarProps) {
export function Avatar({ size = 32 }) {
  // const initial = user.name.trim()[0]?.toUpperCase() ?? '?';
  return (
    <div
      className="rounded-full flex items-center justify-center font-display font-bold flex-shrink-0 bg-surface-tint text-ink"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      MA
    </div>
  );
}

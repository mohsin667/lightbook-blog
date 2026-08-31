import { Heart } from 'lucide-react';
import { Button } from '../ui/Button';

export interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
}

export function LikeButton({ liked, count, onToggle }: LikeButtonProps) {
  return (
    <Button variant={liked ? 'primary' : 'default'} onClick={onToggle}>
      <Heart size={16} strokeWidth={1.75} fill={liked ? 'currentColor' : 'none'} />
      {count} like{count === 1 ? '' : 's'}
    </Button>
  );
}

import { Lock, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { User } from '../../data/mockData';

export interface UserRowProps {
  user: User;
  postCount: number;
  onToggleRestrict: (id: string) => void;
  onDelete: (id: string) => void;
}

export function UserRow({ user, postCount, onToggleRestrict, onDelete }: UserRowProps) {
  const restricted = user.status === 'restricted';
  return (
    <div className="flex items-center gap-3.5 py-3.25 border-b border-border last:border-b-0">
      <Avatar user={user} size={36} />
      <div className="flex-1">
        <div className="font-display font-bold flex items-center gap-1.5">
          {user.name}
          {user.role === 'admin' && <Badge variant="neutral">admin</Badge>}
          {restricted && (
            <Badge variant="danger">
              <Lock size={11} strokeWidth={1.75} />
              restricted
            </Badge>
          )}
        </div>
        <div className="text-[12.5px] text-ink-soft">
          {user.email} · {postCount} posts · joined {user.joinedAt}
        </div>
      </div>
      <Button size="sm" onClick={() => onToggleRestrict(user.id)}>
        <Lock size={13} strokeWidth={1.75} />
        {restricted ? 'Unrestrict' : 'Restrict'}
      </Button>
      <Button size="sm" variant="danger" onClick={() => onDelete(user.id)}>
        <Trash2 size={13} strokeWidth={1.75} />
        Delete
      </Button>
    </div>
  );
}

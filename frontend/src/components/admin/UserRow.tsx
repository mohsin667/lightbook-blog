import { Lock, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/format';
import type { User } from '../../types';

export interface UserRowProps {
  user: User;
  postCount: number;
  onToggleRestrict: (id: string) => void;
  onDelete: (id: string) => void;
}

export function UserRow({ user, postCount, onToggleRestrict, onDelete }: UserRowProps) {
  const restricted = user.is_banned;
  return (
    <div className="flex items-center flex-wrap gap-3.5 py-3.25 border-b border-border last:border-b-0">
      <Avatar user={user.display_name} size={36} />
      <div className="flex-1 min-w-[160px]">
        <div className="font-display font-bold flex items-center gap-1.5 flex-wrap">
          {user.display_name}
          {user.role === 'admin' && <Badge variant="neutral">admin</Badge>}
          {restricted && (
            <Badge variant="danger">
              <Lock size={11} strokeWidth={1.75} />
              restricted
            </Badge>
          )}
        </div>
        <div className="text-[12.5px] text-ink-soft">
          {user.email} · {postCount} posts · joined {formatDate(user.created_at)}
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

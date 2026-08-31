import { Check, Flag, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CategoryBadge } from '../post/CategoryBadge';
import { getUserById, type Post } from '../../data/mockData';

export interface FlaggedPostRowProps {
  post: Post;
  onDismiss: (id: string) => void;
  onUnpublish: (id: string) => void;
}

export function FlaggedPostRow({ post, onDismiss, onUnpublish }: FlaggedPostRowProps) {
  const author = getUserById(post.authorId);
  return (
    <Card className="mb-3">
      <div className="flex justify-between items-start gap-3.5">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={post.category} />
            <Badge variant="danger">
              <Flag size={12} strokeWidth={1.75} />
              {post.flagCount} report{post.flagCount === 1 ? '' : 's'}
            </Badge>
          </div>
          <div className="font-display font-bold mt-1.5">{post.title}</div>
          <div className="text-[13px] text-ink-soft">
            by {author?.name} · {post.excerpt}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" onClick={() => onDismiss(post.id)}>
            <Check size={13} strokeWidth={1.75} />
            Dismiss
          </Button>
          <Button size="sm" variant="danger" onClick={() => onUnpublish(post.id)}>
            <X size={13} strokeWidth={1.75} />
            Unpublish
          </Button>
        </div>
      </div>
    </Card>
  );
}

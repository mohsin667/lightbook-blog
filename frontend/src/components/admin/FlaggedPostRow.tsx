import { useState } from 'react';
import { Check, Flag, Loader2, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CategoryBadge } from '../post/CategoryBadge';
import type { ReportedPost } from '../../types';

export interface FlaggedPostRowProps {
  reported: ReportedPost;
  onDismiss: (postId: string) => void | Promise<void>;
  onUnpublish: (postId: string) => void | Promise<void>;
}

export function FlaggedPostRow({ reported, onDismiss, onUnpublish }: FlaggedPostRowProps) {
  const { post, report_count } = reported;
  const [pending, setPending] = useState<'dismiss' | 'unpublish' | null>(null);

  const handleDismiss = async () => {
    setPending('dismiss');
    try {
      await onDismiss(post.id);
    } finally {
      setPending(null);
    }
  };

  const handleUnpublish = async () => {
    setPending('unpublish');
    try {
      await onUnpublish(post.id);
    } finally {
      setPending(null);
    }
  };

  return (
    <Card className="mb-3">
      <div className="flex flex-wrap justify-between items-start gap-3.5">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category_name={post.category_name} />
            <Badge variant="danger">
              <Flag size={12} strokeWidth={1.75} />
              {report_count} report{report_count === 1 ? '' : 's'}
            </Badge>
          </div>
          <div className="font-display font-bold mt-1.5">{post.title}</div>
          <div className="text-[13px] text-ink-soft">
            by {post.author_name} · {post.excerpt}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" disabled={pending !== null} onClick={handleDismiss}>
            {pending === 'dismiss' ? (
              <Loader2 size={13} strokeWidth={1.75} className="animate-spin" />
            ) : (
              <Check size={13} strokeWidth={1.75} />
            )}
            Dismiss
          </Button>
          <Button size="sm" variant="danger" disabled={pending !== null} onClick={handleUnpublish}>
            {pending === 'unpublish' ? (
              <Loader2 size={13} strokeWidth={1.75} className="animate-spin" />
            ) : (
              <X size={13} strokeWidth={1.75} />
            )}
            Unpublish
          </Button>
        </div>
      </div>
    </Card>
  );
}

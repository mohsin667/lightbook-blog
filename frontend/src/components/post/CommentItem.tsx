import { Loader2, Trash2 } from 'lucide-react';
import { timeAgo } from '../../utils/format';
import type { Comment } from '../../types';

export interface CommentItemProps {
  comment: Comment;
  canDelete?: boolean;
  deleting?: boolean;
  onDelete?: (id: string) => void;
}

export function CommentItem({ comment, canDelete = false, deleting = false, onDelete }: CommentItemProps) {
  return (
    <div className="flex items-start gap-3.5 py-3 border-b border-border last:border-b-0">
      <div className="w-7 h-7 rounded-full bg-surface-tint text-ink flex items-center justify-center text-xs font-display font-bold flex-shrink-0">
        {comment.author_name[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1">
        <div className="font-display font-bold text-sm flex items-center gap-1.5">
          {comment.author_name}
          <span className="text-[12px] text-ink-soft font-normal">{timeAgo(comment.created_at)}</span>
        </div>
        <div className="text-sm text-ink-soft">{comment.content}</div>
      </div>
      {canDelete && onDelete && (
        <button
          onClick={() => onDelete(comment.id)}
          disabled={deleting}
          title="Delete comment"
          className="text-ink-soft hover:text-danger flex-shrink-0 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
          ) : (
            <Trash2 size={14} strokeWidth={1.75} />
          )}
        </button>
      )}
    </div>
  );
}

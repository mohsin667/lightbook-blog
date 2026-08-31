import type { Comment } from '../../data/mockData';

export function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex items-start gap-3.5 py-3 border-b border-border last:border-b-0">
      <div className="w-7 h-7 rounded-full bg-surface-tint text-ink flex items-center justify-center text-xs font-display font-bold flex-shrink-0">
        {comment.author[0]?.toUpperCase()}
      </div>
      <div>
        <div className="font-display font-bold text-sm">{comment.author}</div>
        <div className="text-sm text-ink-soft">{comment.text}</div>
      </div>
    </div>
  );
}

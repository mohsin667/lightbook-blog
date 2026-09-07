import { CommentItem } from './CommentItem';
import type { Comment } from '../../types';

export interface CommentListProps {
  comments: Comment[];
  currentUserId?: string | null;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

export function CommentList({ comments, currentUserId, isAdmin = false, onDelete }: CommentListProps) {
  if (!comments.length) {
    return <p className="text-ink-soft">No comments yet — say something nice.</p>;
  }
  return (
    <div className="mb-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          canDelete={isAdmin || comment.author_id === currentUserId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

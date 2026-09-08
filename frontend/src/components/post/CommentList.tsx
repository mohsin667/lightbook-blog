import { useState } from 'react';
import { CommentItem } from './CommentItem';
import type { Comment } from '../../types';

export interface CommentListProps {
  comments: Comment[];
  currentUserId?: string | null;
  isAdmin?: boolean;
  onDelete?: (id: string) => void | Promise<void>;
}

export function CommentList({ comments, currentUserId, isAdmin = false, onDelete }: CommentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!comments.length) {
    return <p className="text-ink-soft">No comments yet — say something nice.</p>;
  }

  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mb-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          canDelete={isAdmin || comment.author_id === currentUserId}
          deleting={deletingId === comment.id}
          onDelete={onDelete ? handleDelete : undefined}
        />
      ))}
    </div>
  );
}

import { CommentItem } from './CommentItem';
import type { Comment } from '../../data/mockData';

export function CommentList({ comments }: { comments: Comment[] }) {
  if (!comments.length) {
    return <p className="text-ink-soft">No comments yet — say something nice.</p>;
  }
  return (
    <div className="mb-4">
      {comments.map((comment, i) => (
        <CommentItem key={i} comment={comment} />
      ))}
    </div>
  );
}

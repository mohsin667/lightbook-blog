import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, Clock, Eye, Flag, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { CategoryBadge } from '../components/post/CategoryBadge';
import { StatusBadge } from '../components/post/StatusBadge';
import { PostContent } from '../components/post/PostContent';
import { LikeButton } from '../components/post/LikeButton';
import { CommentList } from '../components/post/CommentList';
import { CommentForm } from '../components/post/CommentForm';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { showToast } from '../features/toast/toastSlice';
import { formatReadTime, timeAgo } from '../utils/format';
import { getPost, toggleLike, reportPost, toggleBookmark } from '../features/posts/createPostThunk';
import { fetchComments, addComment, deleteComment, clearComments } from '../features/comments/commentsSlice';

export function PostPage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const post = useAppSelector((s) => s.posts.current);
  const comments = useAppSelector((s) => s.comments.list);
  const authUser = useAppSelector((s) => s.auth.user);
  const postId = post?.id;

  useEffect(() => {
    dispatch(getPost({ id }));
    return () => {
      dispatch(clearComments());
    };
  }, [dispatch, id]);

  // comments are keyed off the post's id, which is only known once it loads
  useEffect(() => {
    if (postId) dispatch(fetchComments({ postId }));
  }, [dispatch, postId]);

  if (!post) {
    return (
      <div className="max-w-190 mx-auto px-6 pt-7">
        <p>Post not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-190 mx-auto px-6 pt-7">
      <Link to="/" className="inline-flex items-center gap-1.5 mb-4.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft size={15} strokeWidth={1.75} />
        Back
      </Link>

      <div className="flex items-center gap-2 flex-wrap">
        <CategoryBadge category_name={post.category_name} />
        <StatusBadge status={post.status} />
      </div>

      <h1 className="text-[30px] font-display font-bold mt-3.5 mb-2.5">{post.title}</h1>

      <div className="flex items-center gap-2 text-sm text-ink-soft mb-5.5 flex-wrap">
        <Avatar user={post.author_name} size={28} />
        <Link to={`/profile/${post.author_id}`} className="font-display font-bold text-ink">
          {post.author_name}
        </Link>
        <span className="opacity-50">·</span>
        <Clock size={13} strokeWidth={1.75} />
        <span>{formatReadTime(post.read_time_minutes)}</span>
        <span className="opacity-50">·</span>
        <Eye size={13} strokeWidth={1.75} />
        <span>{post.view_count} views</span>
        <span className="opacity-50">·</span>
        <span>{timeAgo(post.published_at ?? post.created_at)}</span>
      </div>

      {post.cover_image_url && (
        <div className="w-full aspect-video rounded-xl overflow-hidden border border-border mb-6.5">
          <img src={post.cover_image_url} alt="" loading="lazy" className="w-full h-full object-cover block" />
        </div>
      )}

      <PostContent content={post.content} />

      <div className="flex gap-2.5 my-6.5">
        <LikeButton
          liked={post.liked_by_me}
          count={post.like_count}
          onToggle={() => dispatch(toggleLike({ postId: post.id, liked: post.liked_by_me }))}
        />
        {authUser && (
          <Button
            size="md"
            variant={post.bookmarked_by_me ? 'primary' : 'default'}
            onClick={() => {
              dispatch(toggleBookmark({ postId: post.id, bookmarked: post.bookmarked_by_me }));
              dispatch(showToast(
                post.bookmarked_by_me ? 'Bookmark removed' : 'Bookmarked', Bookmark));
            }}
          >
            <Bookmark
              size={15}
              strokeWidth={1.75}
              fill={post.bookmarked_by_me ? 'currentColor' : 'none'}
            />
            {post.bookmarked_by_me ? 'Saved' : 'Save'}
          </Button>
        )}
        <Button
          size="md"
          onClick={() => {
            dispatch(reportPost({ postId: post.id }));
            dispatch(showToast('Reported for review', Flag));
          }}
        >
          <Flag size={15} strokeWidth={1.75} />
          Report
        </Button>
      </div>

      <hr className="border-border my-6" />
      <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
        <MessageCircle size={18} strokeWidth={1.75} />
        Comments ({comments.length})
      </div>
      <CommentList
        comments={comments}
        currentUserId={authUser?.id}
        isAdmin={authUser?.role === 'admin'}
        onDelete={async (commentId) => {
          const result = await dispatch(deleteComment(commentId));
          if (deleteComment.rejected.match(result)) {
            dispatch(showToast((result.payload as string) ?? 'Could not delete comment'));
            return;
          }
          dispatch(showToast('Comment deleted', Trash2));
        }}
      />
      {authUser ? (
        <CommentForm
          onSubmit={async (text) => {
            const result = await dispatch(addComment({ postId: post.id, content: text }));
            if (addComment.rejected.match(result)) {
              dispatch(showToast((result.payload as string) ?? 'Could not add comment'));
              return;
            }
            dispatch(showToast('Comment added', MessageCircle));
          }}
        />
      ) : (
        <p className="text-ink-soft text-sm">
          <Link to="/signin" className="text-coral">Sign in</Link> to leave a comment.
        </p>
      )}
    </div>
  );
}

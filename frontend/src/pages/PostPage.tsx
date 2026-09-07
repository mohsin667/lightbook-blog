import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Flag, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { CategoryBadge } from '../components/post/CategoryBadge';
import { StatusBadge } from '../components/post/StatusBadge';
import { PostContent } from '../components/post/PostContent';
import { LikeButton } from '../components/post/LikeButton';
// import { CommentList } from '../components/post/CommentList';
// import { CommentForm } from '../components/post/CommentForm';
// import { PostGrid } from '../components/post/PostGrid';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { toggleLike, reportPost } from '../features/posts/postsSlice';
import { showToast } from '../features/toast/toastSlice';
import { readTime, timeAgo } from '../data/mockData';
import { getPost } from '../features/posts/createPostThunk';

export function PostPage() {

  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const post = useAppSelector((s) => s.posts.current);
  console.log(post, "post in postpage")
  useEffect(() => {
    dispatch(getPost({ id }))
  }, [])

  if (!post) {
    return (
      <div className="max-w-190 mx-auto px-6 pt-7">
        <p>Post not found.</p>
      </div>
    );
  }

  const liked = false;

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

      {post.author_name && (
        <div className="flex items-center gap-2 text-sm text-ink-soft mb-5.5 flex-wrap">
          <Avatar user={post.author_name} size={28} />
          <div className="font-display font-bold text-ink">
            {post.author_name}
          </div>
          <span className="opacity-50">·</span>
          <Clock size={13} strokeWidth={1.75} />
          <span>{readTime(post.content)}</span>
          <span className="opacity-50">·</span>
          <Eye size={13} strokeWidth={1.75} />
          <span>{post.views} views</span>
          <span className="opacity-50">·</span>
          <span>{timeAgo(post.updated_at)}</span>
        </div>
      )}

      <div className="w-full aspect-video rounded-xl overflow-hidden border border-border mb-6.5">
        <img src={post.cover_image_url} alt="" className="w-full h-full object-cover block" />
      </div>

      <PostContent content={post.content} />

      <div className="flex gap-2.5 my-6.5">
        <LikeButton liked={liked} count={post.likes} onToggle={() => dispatch(toggleLike(post.id))} />
        <Button
          size="md"
          onClick={() => {
            dispatch(reportPost(post.id));
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
        Comments ({post?.comments?.length})
      </div>
      {/* <CommentList comments={post?.comments} />
      <CommentForm
        onSubmit={(text) => {
          dispatch(addComment({ postId: post.id, author: currentUserName, text }));
          dispatch(showToast('Comment added', MessageCircle));
        }}
      /> */}

      {/* {related.length > 0 && (
        <>
          <hr className="border-border my-6" />
          <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
            <Star size={18} strokeWidth={1.75} />
            More in {post?.category_name}
          </div>
          <PostGrid posts={related} />
        </>
      )} */}
    </div>
  );
}

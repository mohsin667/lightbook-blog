import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Bookmark, Eye, FileText, Heart, PenLine } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/EmptyState';
import { CategoryBadge } from '../components/post/CategoryBadge';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getDrafts, getBookmarks } from '../features/posts/createPostThunk';
import { PostGrid } from '../components/post/PostGrid';
import { timeAgo } from '../utils/format';

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.list);
  const drafts = useAppSelector((s) => s.posts.drafts);
  const bookmarks = useAppSelector((s) => s.posts.bookmarks);
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(getDrafts());
    dispatch(getBookmarks());
  }, [dispatch]);

  const published = posts.filter((p) => p.author_id === user?.id);
  const totalViews = published.reduce((sum, p) => sum + p.view_count, 0);
  const totalLikes = published.reduce((sum, p) => sum + p.like_count, 0);

  return (
    <div className="max-w-[1080px] mx-auto px-6 pt-7">
      <h1 className="text-2xl font-display font-bold mb-1">Hi, {user?.display_name}</h1>
      <p className="text-ink-soft mb-5.5">Here's what's happening with your writing.</p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4 mb-6.5">
        <StatCard label="Published" value={published.length} />
        <StatCard label="Drafts" value={drafts.length} />
        <StatCard label="Total views" value={totalViews} />
        <StatCard label="Total likes" value={totalLikes} />
      </div>

      {drafts.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
            <FileText size={18} strokeWidth={1.75} />
            Continue a draft
          </div>
          <Card className="mb-6.5">
            {drafts.map((p) => (
              <div key={p.id} className="flex items-center gap-3.5 py-3.25 border-b border-border last:border-b-0">
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold truncate">{p.title}</div>
                  <div className="text-[12.5px] text-ink-soft">Last edited {timeAgo(p.updated_at)}</div>
                </div>
                <Link to={`/write/${p.id}`}>
                  <Button size="sm">
                    <PenLine size={13} strokeWidth={1.75} />
                    Continue
                  </Button>
                </Link>
              </div>
            ))}
          </Card>
        </>
      )}

      <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
        <BarChart3 size={18} strokeWidth={1.75} />
        Your posts
      </div>
      <Card className="mb-5">
        {published.length ? (
          published.map((p) => (
            <div key={p.id} className="flex items-center gap-3.5 py-3.25 border-b border-border last:border-b-0">
              <div className="flex-1 min-w-0">
                <CategoryBadge category_name={p.category_name} />
                <div className="font-display font-bold mt-1 truncate">{p.title}</div>
                <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                  <Eye size={12} strokeWidth={1.75} /> {p.view_count}
                  <span>·</span>
                  <Heart size={12} strokeWidth={1.75} /> {p.like_count}
                  <span>·</span>
                  {timeAgo(p.published_at ?? p.created_at)}
                </div>
              </div>
              <Link to={`/write/${p.id}`}>
                <Button size="sm">
                  <PenLine size={13} strokeWidth={1.75} />
                  Edit
                </Button>
              </Link>
            </div>
          ))
        ) : (
          <EmptyState icon={FileText}>Nothing published yet — your first post is one click away.</EmptyState>
        )}
      </Card>

      <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
        <Bookmark size={18} strokeWidth={1.75} />
        Saved posts
      </div>
      <div className="mb-6.5">
        <PostGrid posts={bookmarks} emptyMessage="Nothing saved yet." />
      </div>

      <Link to="/write">
        <Button variant="primary">
          <PenLine size={16} strokeWidth={1.75} />
          Write a new post
        </Button>
      </Link>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { BarChart3, Eye, FileText, Heart, PenLine } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/EmptyState';
import { CategoryBadge } from '../components/post/CategoryBadge';
import { useAppSelector } from '../app/hooks';
import { CURRENT_USER_ID, currentUser, timeAgo } from '../data/mockData';

export function DashboardPage() {
  const posts = useAppSelector((s) => s.posts.list);
  const user = currentUser();
  const mine = posts.filter((p) => p.authorId === CURRENT_USER_ID);
  const published = mine.filter((p) => p.status === 'published' || p.status === 'flagged');
  const drafts = mine.filter((p) => p.status === 'draft');
  const totalViews = published.reduce((s, p) => s + p.views, 0);
  const totalLikes = published.reduce((s, p) => s + p.likes, 0);

  return (
    <div className="max-w-[1080px] mx-auto px-6 pt-7">
      <h1 className="text-2xl font-display font-bold mb-1">Hi, {user.name}</h1>
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
                <div className="flex-1">
                  <div className="font-display font-bold">{p.title}</div>
                  <div className="text-[12.5px] text-ink-soft">Last edited {timeAgo(p.createdAt)}</div>
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
              <div className="flex-1">
                <CategoryBadge category={p.category} />
                <div className="font-display font-bold mt-1">{p.title}</div>
                <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                  <Eye size={12} strokeWidth={1.75} /> {p.views}
                  <span>·</span>
                  <Heart size={12} strokeWidth={1.75} /> {p.likes}
                  <span>·</span>
                  {timeAgo(p.createdAt)}
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

      <Link to="/write">
        <Button variant="primary">
          <PenLine size={16} strokeWidth={1.75} />
          Write a new post
        </Button>
      </Link>
    </div>
  );
}

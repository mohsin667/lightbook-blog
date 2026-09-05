import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PenLine, Tag, Users } from 'lucide-react';
import { FeaturedHero } from '../components/post/FeaturedHero';
import { PostGrid } from '../components/post/PostGrid';
import { getCategoryIcon } from '../components/post/CategoryBadge';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { useAppSelector } from '../app/hooks';
import { getUserById } from '../data/mockData';

export function HomePage() {
  const posts = useAppSelector((s) => s.posts.list);
  const categories = useAppSelector((s) => s.categories.list);
  const featuredId = useAppSelector((s) => s.posts.featuredId);
  const { status } = useAppSelector((s) => s.auth);
  const [filter, setFilter] = useState('All');

  const published = posts.filter((p) => p.status === 'published');
  const featured = published.find((p) => p.id === featuredId) ?? published[0];
  const filtered = filter === 'All' ? published : published.filter((p) => p.category === filter);
  const others = filtered.filter((p) => p.id !== featured?.id);

  const topAuthors = useMemo(() => {
    const viewsByAuthor: Record<string, number> = {};
    posts.forEach((p) => {
      viewsByAuthor[p.authorId] = (viewsByAuthor[p.authorId] || 0) + p.views;
    });
    return Object.entries(viewsByAuthor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [posts]);


  return (
    <div className="max-w-[1080px] mx-auto px-6 pt-7">
      {featured && <FeaturedHero post={featured} />}

      <div className="grid grid-cols-[2fr_1fr] gap-6 max-[760px]:grid-cols-1">
        <div>
          <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
            <FileText size={18} strokeWidth={1.75} />
            Latest posts
          </div>
          <div className="flex gap-2 flex-wrap mb-4.5">
            <button
              onClick={() => setFilter('All')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-display font-semibold border ${filter === 'All'
                ? 'border-coral bg-coral-light text-ink'
                : 'border-transparent bg-surface-tint text-ink'
                }`}
            >
              All
            </button>
            {/* <select className="bg-surface border border-border rounded-xl py-1.75 px-2" value={filter} onChange={(e) => setFilter(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select> */}
          </div>
          <PostGrid posts={others} emptyMessage="No posts in this category yet." />
        </div>

        <div>
          <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
            <Users size={18} strokeWidth={1.75} />
            Popular authors
          </div>
          <Card className="mb-5">
            {topAuthors.map(([id, views]) => {
              const author = getUserById(id);
              if (!author) return null;
              return (
                <Link
                  key={id}
                  to={`/profile/${id}`}
                  className="flex items-center gap-3.5 py-3.25 border-b border-border last:border-b-0"
                >
                  <Avatar user={author} size={32} />
                  <div>
                    <div className="font-display font-bold">{author.name}</div>
                    <div className="text-[12.5px] text-ink-soft">{views} total views</div>
                  </div>
                </Link>
              );
            })}
          </Card>
          <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
            <Tag size={18} strokeWidth={1.75} />
            Categories
          </div>
          <Card className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const count = posts.filter((p) => p.category === c.name && p.status === 'published').length;
              const Icon = getCategoryIcon(c.icon);
              return (
                <button
                  key={c.name}
                  onClick={() => setFilter(c.name)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-display font-semibold bg-surface-tint text-ink"
                >
                  <Icon size={13} strokeWidth={1.75} className="text-coral" />
                  {c.name} · {count}
                </button>
              );
            })}
          </Card>
        </div>
      </div>

      <Link
        to="/write"
        className="fixed bottom-7 right-7 w-14 h-14 rounded-2xl bg-coral flex items-center justify-center shadow-[0_8px_24px_rgba(255,106,77,0.28)] hover:bg-[#ff7d61]"
        title="Write a post"
      >
        <PenLine size={24} strokeWidth={1.75} className="text-coral-deep" />
      </Link>
    </div>
  );
}

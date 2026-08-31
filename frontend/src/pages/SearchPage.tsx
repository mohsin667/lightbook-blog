import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PostGrid } from '../components/post/PostGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppSelector } from '../app/hooks';
import { getUserById } from '../data/mockData';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const posts = useAppSelector((s) => s.posts.list);
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return posts.filter((p) => {
      if (p.status !== 'published') return false;
      const author = getUserById(p.authorId);
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        author?.name.toLowerCase().includes(q)
      );
    });
  }, [posts, query]);

  const submit = () => setSearchParams(input.trim() ? { q: input.trim() } : {});

  return (
    <div className="max-w-[1080px] mx-auto px-6 pt-7">
      <h1 className="text-2xl font-display font-bold mb-4.5">Search</h1>
      <div className="flex items-center gap-1.5 bg-surface-tint rounded-lg px-4 py-2.5 border border-border focus-within:border-coral max-w-[420px] mb-6">
        <Search size={16} strokeWidth={1.75} className="text-ink-soft" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Search posts, authors, categories"
          className="bg-transparent border-none outline-none w-full text-ink placeholder:text-ink-soft"
        />
      </div>

      {!query.trim() ? (
        <EmptyState icon={Search}>Type something and press enter.</EmptyState>
      ) : results.length ? (
        <PostGrid posts={results} />
      ) : (
        <EmptyState icon={Search}>No posts found for "{query}".</EmptyState>
      )}
    </div>
  );
}

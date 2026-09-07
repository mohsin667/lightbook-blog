import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PostGrid } from '../components/post/PostGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { searchPosts } from '../features/posts/createPostThunk';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const results = useAppSelector((s) => s.posts.searchResults);
  const status = useAppSelector((s) => s.posts.searchStatus);
  const hasMore = useAppSelector((s) => s.posts.searchHasMore);
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);

  useEffect(() => {
    const q = query.trim();
    if (q) dispatch(searchPosts({ q, skip: 0 }));
  }, [dispatch, query]);

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
      ) : status === 'loading' && !results.length ? (
        <EmptyState icon={Search}>Searching…</EmptyState>
      ) : results.length ? (
        <>
          <PostGrid posts={results} />
          {hasMore && (
            <div className="flex justify-center mt-5">
              <Button onClick={() => dispatch(searchPosts({ q: query.trim(), skip: results.length }))}>
                Load more
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState icon={Search}>No posts found for "{query}".</EmptyState>
      )}
    </div>
  );
}

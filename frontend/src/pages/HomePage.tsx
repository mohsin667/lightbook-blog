import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileText, Heart, PenLine, Tag, Users } from 'lucide-react';
import { FeaturedHero } from '../components/post/FeaturedHero';
import { PostGrid } from '../components/post/PostGrid';
import { Pagination } from '../components/ui/Pagination';
import { getIconForCategoryName } from '../components/post/CategoryBadge';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getPostsPage, fetchPostsTotal, PAGE_SIZE } from '../features/posts/createPostThunk';

const ALL = 'ALL';

export function HomePage() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.list);
  const homeFeed = useAppSelector((s) => s.posts.homeFeed);
  const total = useAppSelector((s) => s.posts.total);
  const featuredId = useAppSelector((s) => s.posts.featuredId);
  const categories = useAppSelector((s) => s.categories.list);
  const topAuthors = useAppSelector((s) => s.users.topAuthors);
  const [filter, setFilter] = useState(ALL);
  const [page, setPage] = useState(1);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const CATEGORY_PREVIEW_COUNT = 10;
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, CATEGORY_PREVIEW_COUNT);

  const categoryId = filter === ALL ? undefined : filter;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    dispatch(getPostsPage({ page, categoryId }));
  }, [dispatch, page, categoryId]);

  useEffect(() => {
    dispatch(fetchPostsTotal({ categoryId }));
  }, [dispatch, categoryId]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  const featured = useMemo(
    () => posts.find((p) => p.id === featuredId) ?? posts[0],
    [posts, featuredId],
  );

  return (
    <div className="max-w-270 mx-auto px-6 pt-7">
      {featured && <FeaturedHero post={featured} />}

      <div className="grid grid-cols-[2fr_1fr] gap-6 max-[760px]:grid-cols-1">
        <div>
          <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
            <FileText size={18} strokeWidth={1.75} />
            Latest posts
          </div>
          <div className="mb-4.5 max-w-[260px]">
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full bg-surface-tint border border-border rounded-lg px-3.5 py-2 text-sm font-display font-semibold text-ink outline-none focus:border-coral"
            >
              <option value={ALL}>All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <PostGrid posts={homeFeed} emptyMessage="No posts in this category yet." />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>

        <div>
          <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
            <Users size={18} strokeWidth={1.75} />
            Popular authors
          </div>
          <Card className="mb-5">
            {topAuthors.length ? (
              topAuthors.map((author) => (
                <Link
                  key={author.id}
                  to={`/profile/${author.id}`}
                  className="flex items-center gap-3.5 py-3.25 border-b border-border last:border-b-0"
                >
                  <Avatar user={author.display_name} size={32} />
                  <div>
                    <div className="font-display font-bold">{author.display_name}</div>
                    <div className="flex items-center gap-1 text-[12.5px] text-ink-soft">
                      <Heart size={12} strokeWidth={1.75} />
                      {author.total_likes} total likes
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-ink-soft text-sm m-0">No authors yet.</p>
            )}
          </Card>
          <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
            <Tag size={18} strokeWidth={1.75} />
            Categories
          </div>
          <Card>
            <div className="flex flex-wrap gap-2">
              {visibleCategories.map((c) => {
                const Icon = getIconForCategoryName(c.name);
                return (
                  <button
                    key={c.id}
                    onClick={() => handleFilterChange(c.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-display font-semibold border ${filter === c.id
                      ? 'border-coral bg-coral-light text-ink'
                      : 'border-transparent bg-surface-tint text-ink'
                      }`}
                  >
                    <Icon size={13} strokeWidth={1.75} className="text-coral" />
                    {c.name}
                  </button>
                );
              })}
            </div>
            {categories.length > CATEGORY_PREVIEW_COUNT && (
              <button
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="flex items-center gap-1 mt-3 text-[13px] font-display font-semibold text-coral"
              >
                {showAllCategories ? (
                  <>
                    Show less
                    <ChevronUp size={14} strokeWidth={1.75} />
                  </>
                ) : (
                  <>
                    Show more
                    <ChevronDown size={14} strokeWidth={1.75} />
                  </>
                )}
              </button>
            )}
          </Card>
        </div>
      </div>

      {/* Hidden on mobile — the bottom nav's center button covers this there. */}
      <Link
        to="/write"
        className="hidden min-[761px]:flex fixed bottom-7 right-7 w-14 h-14 rounded-2xl bg-coral items-center justify-center shadow-[0_8px_24px_rgba(255,106,77,0.28)] hover:bg-[#ff7d61]"
        title="Write a post"
      >
        <PenLine size={24} strokeWidth={1.75} className="text-coral-deep" />
      </Link>
    </div>
  );
}

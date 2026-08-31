import { useState } from 'react';
import { ShieldCheck, Star, Trash2, Check, X, Lock, Plus, BarChart3, Users } from 'lucide-react';
import { AdminTabs, type AdminTabId } from '../components/admin/AdminTabs';
import { UserRow } from '../components/admin/UserRow';
import { FlaggedPostRow } from '../components/admin/FlaggedPostRow';
import { CategoryRow } from '../components/admin/CategoryRow';
import { FeaturedPostSelect } from '../components/admin/FeaturedPostSelect';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { BarRow } from '../components/ui/BarRow';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getUserById } from '../data/mockData';
import { showToast } from '../features/toast/toastSlice';
import { dismissFlag, unpublishPost, setFeatured } from '../features/posts/postsSlice';
import { toggleRestrictUser, deleteUser } from '../features/users/usersSlice';
import { addCategory, deleteCategory } from '../features/categories/categoriesSlice';

export function AdminPage() {
  const [tab, setTab] = useState<AdminTabId>('overview');
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.list);
  const users = useAppSelector((s) => s.users.list);
  const categories = useAppSelector((s) => s.categories.list);
  const featuredId = useAppSelector((s) => s.posts.featuredId);

  return (
    <div className="max-w-[1080px] mx-auto px-6 pt-7">
      <h1 className="flex items-center gap-2.5 text-2xl font-display font-bold mb-4.5">
        <ShieldCheck size={22} strokeWidth={1.75} />
        Admin dashboard
      </h1>

      <AdminTabs activeTab={tab} onTabChange={setTab} />

      {tab === 'overview' && <OverviewTab />}
      {tab === 'users' && (
        <Card>
          {users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              postCount={posts.filter((p) => p.authorId === u.id).length}
              onToggleRestrict={(id) => {
                dispatch(toggleRestrictUser(id));
                dispatch(showToast('User status updated', Lock));
              }}
              onDelete={(id) => {
                dispatch(deleteUser(id));
                dispatch(showToast('User deleted', Trash2));
              }}
            />
          ))}
        </Card>
      )}
      {tab === 'moderation' && (
        <>
          {posts.filter((p) => p.status === 'flagged').length ? (
            posts
              .filter((p) => p.status === 'flagged')
              .map((p) => (
                <FlaggedPostRow
                  key={p.id}
                  post={p}
                  onDismiss={(id) => {
                    dispatch(dismissFlag(id));
                    dispatch(showToast('Flag dismissed', Check));
                  }}
                  onUnpublish={(id) => {
                    dispatch(unpublishPost(id));
                    dispatch(showToast('Post unpublished', X));
                  }}
                />
              ))
          ) : (
            <EmptyState icon={Check}>No flagged posts. All clear.</EmptyState>
          )}
        </>
      )}
      {tab === 'analytics' && <AnalyticsTab />}
      {tab === 'settings' && (
        <div className="grid grid-cols-[2fr_1fr] gap-6 max-[760px]:grid-cols-1">
          <div>
            <div className="text-lg font-display font-bold mb-3.5">Categories</div>
            <Card className="mb-4">
              {categories.map((c) => (
                <CategoryRow
                  key={c.name}
                  category={c}
                  inUse={posts.some((p) => p.category === c.name)}
                  onDelete={(name) => {
                    dispatch(deleteCategory(name));
                    dispatch(showToast('Category removed', Trash2));
                  }}
                />
              ))}
            </Card>
            <AddCategoryForm onAdd={(name) => dispatch(addCategory(name))} />
          </div>
          <div>
            <div className="text-lg font-display font-bold mb-3.5">Featured post</div>
            <Card>
              <FeaturedPostSelect
                posts={posts.filter((p) => p.status === 'published')}
                featuredId={featuredId}
                onChange={(id) => {
                  dispatch(setFeatured(id));
                  dispatch(showToast('Featured post updated', Star));
                }}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab() {
  const posts = useAppSelector((s) => s.posts.list);
  const users = useAppSelector((s) => s.users.list);
  const categories = useAppSelector((s) => s.categories.list);
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const publishedToday = posts.filter(
    (p) => p.status === 'published' && Date.now() - p.createdAt < 86400000,
  ).length;
  const flagged = posts.filter((p) => p.status === 'flagged').length;

  const byCategory = categories.map((c) => ({
    name: c.name,
    count: posts.filter((p) => p.category === c.name).length,
  }));
  const maxCount = Math.max(1, ...byCategory.map((c) => c.count));

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4 mb-6">
        <StatCard label="Total users" value={totalUsers} />
        <StatCard label="Total posts" value={totalPosts} />
        <StatCard label="Published today" value={publishedToday} />
        <StatCard label="Flagged, pending" value={flagged} />
      </div>
      <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
        <BarChart3 size={18} strokeWidth={1.75} />
        Posts by category
      </div>
      <Card>
        {byCategory.map((c) => (
          <BarRow key={c.name} label={c.name} count={c.count} pct={(c.count / maxCount) * 100} />
        ))}
      </Card>
    </>
  );
}

function AnalyticsTab() {
  const posts = useAppSelector((s) => s.posts.list);
  const published = posts.filter((p) => p.status === 'published');
  const topPosts = [...published].sort((a, b) => b.views - a.views).slice(0, 5);

  const authorStats: Record<string, { views: number; likes: number }> = {};
  published.forEach((p) => {
    authorStats[p.authorId] = authorStats[p.authorId] || { views: 0, likes: 0 };
    authorStats[p.authorId].views += p.views;
    authorStats[p.authorId].likes += p.likes;
  });
  const topAuthors = Object.entries(authorStats)
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-[2fr_1fr] gap-6 max-[760px]:grid-cols-1">
      <div>
        <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
          <Star size={18} strokeWidth={1.75} />
          Top posts by views
        </div>
        <Card padded={false}>
          {topPosts.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3.5 py-3.25 px-4.5 border-b border-border last:border-b-0">
              <div className="w-6 font-display font-bold text-ink-soft">{i + 1}</div>
              <div className="flex-1">
                <div className="font-display font-bold">{p.title}</div>
                <div className="text-[12.5px] text-ink-soft">
                  {p.views} views · {p.likes} likes
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <div>
        <div className="flex items-center gap-2 text-lg font-display font-bold mb-3.5">
          <Users size={18} strokeWidth={1.75} />
          Top authors
        </div>
        <Card padded={false}>
          {topAuthors.map(([id, s]) => {
            const author = getUserById(id);
            if (!author) return null;
            return (
              <div key={id} className="flex items-center gap-3.5 py-3.25 px-4.5 border-b border-border last:border-b-0">
                <Avatar user={author} size={28} />
                <div className="flex-1">
                  <div className="font-display font-bold">{author.name}</div>
                  <div className="text-[12.5px] text-ink-soft">
                    {s.views} views · {s.likes} likes
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function AddCategoryForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState('');
  const dispatch = useAppDispatch();

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    dispatch(showToast('Category added', Check));
    setName('');
  };

  return (
    <Card>
      <div className="mb-4.5">
        <Input
          label="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Music"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
      </div>
      <Button variant="primary" onClick={handleAdd}>
        <Plus size={15} strokeWidth={1.75} />
        Add category
      </Button>
    </Card>
  );
}

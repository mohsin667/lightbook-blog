import { useEffect, useState } from 'react';
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
import { showToast } from '../features/toast/toastSlice';
import { dismissFlag, unpublishPost, setFeatured, getReportedPosts } from '../features/posts/createPostThunk';
import { toggleRestrictUser, deleteUser, getAllUsers } from '../features/users/usersSlice';
import { addCategory, deleteCategory } from '../features/categories/categoriesSlice';

export function AdminPage() {
  const [tab, setTab] = useState<AdminTabId>('overview');
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.list);
  const users = useAppSelector((s) => s.users.list);
  const categories = useAppSelector((s) => s.categories.list);
  const reported = useAppSelector((s) => s.posts.reported);
  const featuredId = useAppSelector((s) => s.posts.featuredId);

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getReportedPosts());
  }, [dispatch]);

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
              postCount={posts.filter((p) => p.author_id === u.id).length}
              onToggleRestrict={async (id) => {
                const result = await dispatch(toggleRestrictUser({ id, banned: !u.is_banned }));
                dispatch(toggleRestrictUser.rejected.match(result)
                  ? showToast((result.payload as string) ?? 'Could not update user')
                  : showToast(u.is_banned ? 'User unrestricted' : 'User restricted', Lock));
              }}
              onDelete={async (id) => {
                const result = await dispatch(deleteUser(id));
                dispatch(deleteUser.rejected.match(result)
                  ? showToast((result.payload as string) ?? 'Could not delete user')
                  : showToast('User deleted', Trash2));
              }}
            />
          ))}
        </Card>
      )}
      {tab === 'moderation' && (
        <>
          {reported.length ? (
            reported.map((r) => (
              <FlaggedPostRow
                key={r.post.id}
                reported={r}
                onDismiss={(postId) => {
                  dispatch(dismissFlag(postId));
                  dispatch(showToast('Flag dismissed', Check));
                }}
                onUnpublish={(postId) => {
                  dispatch(unpublishPost(postId));
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
                  key={c.id}
                  category={c}
                  inUse={posts.some((p) => p.category_id === c.id)}
                  onDelete={async (id) => {
                    const result = await dispatch(deleteCategory(id));
                    dispatch(deleteCategory.rejected.match(result)
                      ? showToast((result.payload as string) ?? 'Could not remove category')
                      : showToast('Category removed', Trash2));
                  }}
                />
              ))}
            </Card>
            <AddCategoryForm />
          </div>
          <div>
            <div className="text-lg font-display font-bold mb-3.5">Featured post</div>
            <Card>
              <FeaturedPostSelect
                posts={posts}
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
  const reported = useAppSelector((s) => s.posts.reported);
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const publishedToday = posts.filter(
    (p) => p.published_at && Date.now() - new Date(p.published_at).getTime() < 86400000,
  ).length;

  const byCategory = categories.map((c) => ({
    name: c.name,
    count: posts.filter((p) => p.category_id === c.id).length,
  }));
  const maxCount = Math.max(1, ...byCategory.map((c) => c.count));

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4 mb-6">
        <StatCard label="Total users" value={totalUsers} />
        <StatCard label="Total posts" value={totalPosts} />
        <StatCard label="Published today" value={publishedToday} />
        <StatCard label="Flagged, pending" value={reported.length} />
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
  const topAuthors = useAppSelector((s) => s.users.topAuthors);
  const topPosts = [...posts].sort((a, b) => b.view_count - a.view_count).slice(0, 5);

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
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold truncate">{p.title}</div>
                <div className="text-[12.5px] text-ink-soft">
                  {p.view_count} views · {p.like_count} likes
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
          {topAuthors.map((author) => (
            <div key={author.id} className="flex items-center gap-3.5 py-3.25 px-4.5 border-b border-border last:border-b-0">
              <Avatar user={author.display_name} size={28} />
              <div className="flex-1">
                <div className="font-display font-bold">{author.display_name}</div>
                <div className="text-[12.5px] text-ink-soft">{author.total_likes} likes</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function AddCategoryForm() {
  const [name, setName] = useState('');
  const dispatch = useAppDispatch();

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const result = await dispatch(addCategory(trimmed));
    if (addCategory.rejected.match(result)) {
      dispatch(showToast((result.payload as string) ?? 'Could not add category'));
      return;
    }
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

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, PenLine } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { StatCard } from '../components/ui/StatCard';
import { PostGrid } from '../components/post/PostGrid';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { CURRENT_USER_ID, getUserById } from '../data/mockData';
import { updateProfile } from '../features/users/usersSlice';
import { showToast } from '../features/toast/toastSlice';

export function ProfilePage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.list);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const user = getUserById(id);
  const isSelf = id === CURRENT_USER_ID;

  if (!user) {
    return (
      <div className="max-w-[760px] mx-auto px-6 pt-7">
        <p>User not found.</p>
      </div>
    );
  }

  const published = posts.filter((p) => p.authorId === user.id && p.status === 'published');
  const totalViews = published.reduce((s, p) => s + p.views, 0);
  const totalLikes = published.reduce((s, p) => s + p.likes, 0);

  const startEditing = () => {
    setName(user.name);
    setBio(user.bio);
    setIsEditing(true);
  };

  const handleSave = () => {
    dispatch(updateProfile({ name: name.trim(), bio: bio.trim() }));
    dispatch(showToast('Profile updated', Check));
    setIsEditing(false);
  };

  return (
    <div className="max-w-[760px] mx-auto px-6 pt-7">
      {isEditing ? (
        <Card className="max-w-[500px] mb-5.5">
          <h2 className="text-xl font-display font-bold mt-0 mb-4">Edit profile</h2>
          <div className="mb-4.5">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="mb-4.5">
            <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[90px]" />
          </div>
          <div className="flex gap-2.5">
            <Button variant="primary" onClick={handleSave}>
              <Check size={16} strokeWidth={1.75} />
              Save changes
            </Button>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </Card>
      ) : (
        <Card className="flex gap-4.5 items-center mb-5.5">
          <Avatar user={user} size={64} />
          <div className="flex-1">
            <h1 className="text-[22px] font-display font-bold m-0">{user.name}</h1>
            <p className="my-1 text-ink-soft">{user.email}</p>
            <p className="m-0">{user.bio}</p>
          </div>
          {isSelf && (
            <Button size="sm" onClick={startEditing}>
              <PenLine size={14} strokeWidth={1.75} />
              Edit
            </Button>
          )}
        </Card>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4 mb-6">
        <StatCard label="Posts" value={published.length} />
        <StatCard label="Total views" value={totalViews} />
        <StatCard label="Total likes" value={totalLikes} />
      </div>

      <div className="text-lg font-display font-bold mb-3.5">Published posts</div>
      <PostGrid posts={published} emptyMessage="Nothing published yet." />
    </div>
  );
}

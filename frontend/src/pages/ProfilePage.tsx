import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, PenLine, UserMinus, UserPlus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { StatCard } from '../components/ui/StatCard';
import { PostGrid } from '../components/post/PostGrid';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { getUserProfile, followUser } from '../features/users/usersSlice';
import { updateProfile } from '../features/auth/checkAuthSlice';
import { showToast } from '../features/toast/toastSlice';

export function ProfilePage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();
  const posts = useAppSelector((s) => s.posts.list);
  const authUser = useAppSelector((s) => s.auth.user);
  const profile = useAppSelector((s) => s.users.profile);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [following, setFollowing] = useState(false);

  const isSelf = authUser?.id === id;

  useEffect(() => {
    if (id && !isSelf) dispatch(getUserProfile({ id }));
  }, [dispatch, id, isSelf]);

  // the server decides whether we already follow this person
  useEffect(() => {
    if (profile?.id === id) setFollowing(profile.followed_by_me);
  }, [profile, id]);

  const user = isSelf ? authUser : profile;

  if (!user) {
    return (
      <div className="max-w-[760px] mx-auto px-6 pt-7">
        <p>User not found.</p>
      </div>
    );
  }

  const published = posts.filter((p) => p.author_id === user.id);
  const totalViews = published.reduce((sum, p) => sum + p.view_count, 0);
  const totalLikes = published.reduce((sum, p) => sum + p.like_count, 0);

  const startEditing = () => {
    setName(user.display_name);
    setBio(user.bio ?? '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    const result = await dispatch(updateProfile({ display_name: name.trim(), bio: bio.trim() }));
    if (updateProfile.rejected.match(result)) {
      dispatch(showToast((result.payload as string) ?? 'Could not update profile'));
      return;
    }
    dispatch(showToast('Profile updated', Check));
    setIsEditing(false);
  };

  const handleFollow = async () => {
    const result = await dispatch(followUser({ id: user.id, following }));
    if (followUser.rejected.match(result)) {
      dispatch(showToast((result.payload as string) ?? 'Could not update follow'));
      return;
    }
    setFollowing(!following);
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
          <Avatar user={user.display_name} size={64} />
          <div className="flex-1">
            <h1 className="text-[22px] font-display font-bold m-0">{user.display_name}</h1>
            <p className="my-1 text-ink-soft">@{user.username}</p>
            <p className="m-0">{user.bio}</p>
          </div>
          {isSelf ? (
            <Button size="sm" onClick={startEditing}>
              <PenLine size={14} strokeWidth={1.75} />
              Edit
            </Button>
          ) : authUser ? (
            <Button size="sm" variant={following ? 'default' : 'primary'} onClick={handleFollow}>
              {following
                ? <UserMinus size={14} strokeWidth={1.75} />
                : <UserPlus size={14} strokeWidth={1.75} />}
              {following ? 'Unfollow' : 'Follow'}
            </Button>
          ) : null}
        </Card>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4 mb-6">
        <StatCard label="Posts" value={published.length} />
        <StatCard label="Total views" value={totalViews} />
        <StatCard label="Total likes" value={totalLikes} />
        {!isSelf && profile && <StatCard label="Followers" value={profile.follower_count} />}
      </div>

      <div className="text-lg font-display font-bold mb-3.5">Published posts</div>
      <PostGrid posts={published} emptyMessage="Nothing published yet." />
    </div>
  );
}

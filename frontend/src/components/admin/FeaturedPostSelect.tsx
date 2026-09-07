import { Select } from '../ui/Select';
import type { Post } from '../../types';

export interface FeaturedPostSelectProps {
  posts: Post[];
  featuredId: string;
  onChange: (id: string) => void;
}

export function FeaturedPostSelect({ posts, featuredId, onChange }: FeaturedPostSelectProps) {
  return (
    <Select label="Currently featured on home" value={featuredId} onChange={(e) => onChange(e.target.value)}>
      <option value="">None</option>
      {posts.map((post) => (
        <option key={post.id} value={post.id}>
          {post.title}
        </option>
      ))}
    </Select>
  );
}

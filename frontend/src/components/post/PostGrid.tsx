import { FileText } from 'lucide-react';
import { PostCard } from './PostCard';
import { EmptyState } from '../ui/EmptyState';
import type { Post } from '../../data/mockData';

export interface PostGridProps {
  posts: Post[];
  emptyMessage?: string;
}

export function PostGrid({ posts, emptyMessage = 'Nothing here yet.' }: PostGridProps) {
  if (!posts.length) {
    return <EmptyState icon={FileText}>{emptyMessage}</EmptyState>;
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

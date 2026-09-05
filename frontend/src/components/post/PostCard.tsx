import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { CategoryBadge } from './CategoryBadge';
import { readTime, type Post, type Category } from '../../data/mockData';

export interface PostCardProps {
  post: Post;
  categories: Category[];
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link to={`/post/${post.slug}`}>
      <Card
        padded={false}
        className="h-full flex flex-col overflow-hidden cursor-pointer transition-colors hover:border-border-strong hover:bg-surface-tint"
      >
        <div className="w-full aspect-[16/10] overflow-hidden bg-surface-tint flex-shrink-0">
          <img src={post.cover_image_url} alt="" loading="lazy" className="w-full h-full object-cover block" />
        </div>
        <div className="p-4 flex flex-col gap-2.5 flex-1">
          <CategoryBadge category_name={post?.category_name} />
          <p className="font-display font-bold text-[17px] leading-snug m-0">{post.title}</p>
          <p className="text-sm text-ink-soft m-0 flex-1">{post.excerpt}</p>
          <div className="flex items-center gap-2 text-[12.5px] text-ink-soft">
            <Avatar size={20} />
            <span>{post.author_name || 'Unknown'}</span>
            <span className="opacity-50">·</span>
            <span>{readTime(post.content)}</span>
            <span className="opacity-50">·</span>
            <Heart size={13} strokeWidth={1.75} />
            <span>{post.likes}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

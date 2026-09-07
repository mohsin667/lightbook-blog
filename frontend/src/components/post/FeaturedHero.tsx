import { Link } from 'react-router-dom';
import { formatReadTime } from '../../utils/format';
import type { Post } from '../../types';

export interface FeaturedHeroProps {
  post: Post;
}

export function FeaturedHero({ post }: FeaturedHeroProps) {
  return (
    <Link
      to={`/post/${post.slug}`}
      className="relative block rounded-2xl overflow-hidden border border-border min-h-[300px] mb-7 bg-surface"
    >
      {post.cover_image_url && (
        <img src={post.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,15,19,0)_0%,rgba(13,15,19,0.92)_100%)]" />
      <div className="relative z-10 p-8 pt-32">
        <div className="flex items-center gap-1.5 mb-3.5">
          <span className="w-2 h-2 bg-coral rounded-sm inline-block" />
          <span className="text-xs font-bold tracking-[0.08em] uppercase text-coral">Featured</span>
        </div>
        <h1 className="text-[34px] leading-[1.15] font-display font-bold m-0 mb-3 text-white max-w-[560px]">
          {post.title}
        </h1>
        <p className="m-0 text-white/75 text-[14.5px]">
          By {post.author_name} · {formatReadTime(post.read_time_minutes)}
        </p>
      </div>
    </Link>
  );
}

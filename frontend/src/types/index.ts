// Mirrors the backend response schemas in backend/app/schemas/.
// Field names here must match the API exactly — no client-side renaming.

export type PostStatus = 'draft' | 'published';

export type UserRole = 'user' | 'admin';

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

/** Matches `PostPublic`. */
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author_id: string;
  author_name: string;
  category_id: string | null;
  category_name: string | null;
  status: PostStatus;
  read_time_minutes: number;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  liked_by_me: boolean;
  bookmarked_by_me: boolean;
  tags: Tag[];
}

/** Matches `CategoryPublic`. */
export interface Category {
  id: string;
  name: string;
  slug: string;
}

/** Matches `UserPublic` — the logged-in user's own record, and admin listings. */
export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_banned: boolean;
  created_at: string;
}

/** Matches `UserSummary` — the public view of another user, with no email. */
export interface UserSummary {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  follower_count: number;
  following_count: number;
  followed_by_me: boolean;
}

/** Matches `TopAuthorPublic` from GET /api/authors/top. */
export interface TopAuthor {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_likes: number;
}

/** Matches `CommentPublic`. */
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

/** Matches `ReportedPostPublic` from GET /api/admin/reports. */
export interface ReportedPost {
  post: Post;
  report_count: number;
}

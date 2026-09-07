import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Post, ReportedPost } from '../../types';
import {
  createPosts, getAllPosts, getPost, getDrafts, searchPosts,
  toggleLike, reportPost, getReportedPosts, dismissFlag, unpublishPost, setFeatured,
  updatePost, publishPost, deletePost, toggleBookmark, getBookmarks, PAGE_SIZE,
} from './createPostThunk';

interface PostsState {
  list: Post[];
  drafts: Post[];
  searchResults: Post[];
  searchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  searchHasMore: boolean;
  /** Posts with open reports, admin-only — from GET /api/admin/reports. */
  reported: ReportedPost[];
  bookmarks: Post[];
  current: Post | null;
  featuredId: string;
  /** How many published posts have been loaded, and whether more remain. */
  loadedCount: number;
  hasMore: boolean;
  status?: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
}

const initialState: PostsState = {
  list: [],
  drafts: [],
  searchResults: [],
  searchStatus: 'idle',
  searchHasMore: false,
  reported: [],
  bookmarks: [],
  current: null,
  featuredId: '',
  loadedCount: 0,
  hasMore: false,
};

/** Apply a change to whichever copies of a post are currently in state. */
function eachCopy(state: PostsState, postId: string, apply: (post: Post) => void) {
  for (const collection of [state.list, state.drafts, state.searchResults]) {
    const found = collection.find((p) => p.id === postId);
    if (found) apply(found);
  }
  if (state.current?.id === postId) apply(state.current);
  const reported = state.reported.find((r) => r.post.id === postId);
  if (reported) apply(reported.post);
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // create a post
    builder.addCase(createPosts.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(createPosts.fulfilled, (state) => {
      state.status = 'succeeded';
    });
    builder.addCase(createPosts.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // get all posts
    builder.addCase(getAllPosts.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(
      getAllPosts.fulfilled,
      (state, action: PayloadAction<{ posts: Post[]; skip: number }>) => {
        const { posts, skip } = action.payload;
        state.status = 'succeeded';
        // skip 0 is a fresh load; anything else is "load more" appending a page
        state.list = skip === 0 ? posts : [...state.list, ...posts];
        state.loadedCount = state.list.length;
        state.hasMore = posts.length === PAGE_SIZE;
        const featured = state.list.find((p) => p.is_featured);
        if (featured) state.featuredId = featured.id;
      },
    );
    builder.addCase(getAllPosts.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // get a single post by slug
    builder.addCase(getPost.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    })
      .addCase(getPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(getPost.rejected, (state, action) => {
        state.status = 'failed';
        state.current = null;
        state.error = action.payload as string;
      });

    // the current user's own drafts
    builder.addCase(getDrafts.fulfilled, (state, action: PayloadAction<Post[]>) => {
      state.drafts = action.payload;
    });

    // full-text search
    builder.addCase(searchPosts.pending, (state) => {
      state.searchStatus = 'loading';
    })
      .addCase(
        searchPosts.fulfilled,
        (state, action: PayloadAction<{ posts: Post[]; skip: number }>) => {
          const { posts, skip } = action.payload;
          state.searchStatus = 'succeeded';
          state.searchResults = skip === 0 ? posts : [...state.searchResults, ...posts];
          state.searchHasMore = posts.length === PAGE_SIZE;
        },
      )
      .addCase(searchPosts.rejected, (state, action) => {
        state.searchStatus = 'failed';
        state.searchResults = [];
        state.searchHasMore = false;
        state.error = action.payload as string;
      });

    // like / unlike — the server is the source of truth for the new count
    builder.addCase(
      toggleLike.fulfilled,
      (state, action: PayloadAction<{ postId: string; liked: boolean; like_count: number }>) => {
        const { postId, liked, like_count } = action.payload;
        eachCopy(state, postId, (post) => {
          post.liked_by_me = liked;
          post.like_count = like_count;
        });
      },
    );
    builder.addCase(toggleLike.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(reportPost.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // bookmark / un-bookmark
    builder.addCase(
      toggleBookmark.fulfilled,
      (state, action: PayloadAction<{ postId: string; bookmarked: boolean }>) => {
        const { postId, bookmarked } = action.payload;
        eachCopy(state, postId, (post) => { post.bookmarked_by_me = bookmarked; });
        if (!bookmarked) state.bookmarks = state.bookmarks.filter((p) => p.id !== postId);
      },
    );
    builder.addCase(toggleBookmark.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(getBookmarks.fulfilled, (state, action: PayloadAction<Post[]>) => {
      state.bookmarks = action.payload;
    });

    // moderation queue
    builder.addCase(getReportedPosts.fulfilled, (state, action: PayloadAction<ReportedPost[]>) => {
      state.reported = action.payload;
    });
    builder.addCase(dismissFlag.fulfilled, (state, action: PayloadAction<string>) => {
      state.reported = state.reported.filter((r) => r.post.id !== action.payload);
    });

    // unpublish drops the post out of the published list and the moderation queue
    builder.addCase(unpublishPost.fulfilled, (state, action: PayloadAction<Post>) => {
      const post = action.payload;
      state.list = state.list.filter((p) => p.id !== post.id);
      state.reported = state.reported.filter((r) => r.post.id !== post.id);
      state.searchResults = state.searchResults.filter((p) => p.id !== post.id);
      if (!state.drafts.some((p) => p.id === post.id)) state.drafts.unshift(post);
      if (state.current?.id === post.id) state.current = post;
      if (state.featuredId === post.id) state.featuredId = '';
    });
    builder.addCase(unpublishPost.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // edit an existing post: refresh whichever copies are in state
    builder.addCase(updatePost.fulfilled, (state, action: PayloadAction<Post>) => {
      const post = action.payload;
      for (const key of ['list', 'drafts', 'searchResults'] as const) {
        const i = state[key].findIndex((p) => p.id === post.id);
        if (i !== -1) state[key][i] = post;
      }
      if (state.current?.id === post.id) state.current = post;
    });
    builder.addCase(updatePost.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // publishing moves a post out of drafts and into the published list
    builder.addCase(publishPost.fulfilled, (state, action: PayloadAction<Post>) => {
      const post = action.payload;
      state.drafts = state.drafts.filter((p) => p.id !== post.id);
      const i = state.list.findIndex((p) => p.id === post.id);
      if (i === -1) state.list.unshift(post);
      else state.list[i] = post;
      if (state.current?.id === post.id) state.current = post;
    });
    builder.addCase(publishPost.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.list = state.list.filter((p) => p.id !== id);
      state.drafts = state.drafts.filter((p) => p.id !== id);
      state.searchResults = state.searchResults.filter((p) => p.id !== id);
      state.reported = state.reported.filter((r) => r.post.id !== id);
      if (state.current?.id === id) state.current = null;
      if (state.featuredId === id) state.featuredId = '';
    });
    builder.addCase(deletePost.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // exactly one post is featured at a time
    builder.addCase(setFeatured.fulfilled, (state, action: PayloadAction<Post>) => {
      const post = action.payload;
      state.list.forEach((p) => { p.is_featured = p.id === post.id; });
      state.featuredId = post.id;
    });
    builder.addCase(setFeatured.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  }
});

export default postsSlice.reducer;

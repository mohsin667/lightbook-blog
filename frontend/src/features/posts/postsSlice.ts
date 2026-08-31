import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { posts as initialPosts, featuredPostId as initialFeaturedId, type Post } from '../../data/mockData';

export interface NewPostInput {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  status: 'published' | 'draft';
}

interface PostsState {
  list: Post[];
  featuredId: string;
}

const initialState: PostsState = {
  list: initialPosts,
  featuredId: initialFeaturedId,
};

// Every reducer below is an intentional no-op. The actions exist so
// components have something real to dispatch and the Redux wiring is
// complete end-to-end, but none of them mutate `list` or `featuredId` —
// this is a static UI, not a working app. Fill in real logic yourself.
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    incrementViews(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
    toggleLike(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
    addComment(_state, _action: PayloadAction<{ postId: string; author: string; text: string }>) {
      // TODO: implement
    },
    reportPost(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
    postCreated(_state, _action: PayloadAction<NewPostInput>) {
      // TODO: implement
    },
    postUpdated(_state, _action: PayloadAction<{ id: string } & NewPostInput>) {
      // TODO: implement
    },
    deletePost(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
    dismissFlag(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
    unpublishPost(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
    setFeatured(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
  },
});

export const {
  incrementViews,
  toggleLike,
  addComment,
  reportPost,
  postCreated,
  postUpdated,
  deletePost,
  dismissFlag,
  unpublishPost,
  setFeatured,
} = postsSlice.actions;
export default postsSlice.reducer;

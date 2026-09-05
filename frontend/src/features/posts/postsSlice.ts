import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { posts as initialPosts, featuredPostId as initialFeaturedId, type Post } from '../../data/mockData';
import {createPosts, getAllPosts, getPost} from './createPostThunk'

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
  current: Post | null;
  featuredId: string;
  status?: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string | null;
}

const initialState: PostsState = {
  list: initialPosts,
  current:  null,
  featuredId: initialFeaturedId,
};


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
  extraReducers: (builder) => {
  //create a post
  builder.addCase(createPosts.pending, (state, action) => {
    state.status = 'loading';
    state.error = null
  });

  builder.addCase(createPosts.fulfilled, (state, action) => {
    state.status = 'succeeded';
  });

  builder.addCase(createPosts.rejected, (state, action) => {
    state.status = 'failed';
    state.error = action.payload as string;
  });
  // get all posts
  builder.addCase(getAllPosts.pending, (state, action) => {
    state.status = 'loading';
    state.error = null
  });

  builder.addCase(getAllPosts.fulfilled, (state, action) => {
    state.status = 'succeeded';
    state.list = action.payload;
  });

  builder.addCase(getAllPosts.rejected, (state, action) => {
    state.status = 'failed';
    state.error = action.payload as string;
  });
  //get a single post by id
  builder.addCase(getPost.pending, (state) => {
    state.status = 'loading';
    state.error = null;
  })
  .addCase(getPost.fulfilled, (state, action) => {
    state.status = 'succeeded';
    state.current = action.payload;
  })
  .addCase(getPost.rejected, (state, action) => {
    state.status = 'failed';
    state.error = action.payload as string;
  });
}

});

export const {
  incrementViews,
  toggleLike,
  addComment,
  reportPost,
  dismissFlag,
  unpublishPost,
  setFeatured,
} = postsSlice.actions;
export default postsSlice.reducer;

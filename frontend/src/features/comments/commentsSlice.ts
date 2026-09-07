import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Comment } from '../../types';
import refreshAPI from '../../api/refreshAPI';

interface CommentsState {
  list: Comment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CommentsState = {
  list: [],
  status: 'idle',
  error: null,
};

export const fetchComments = createAsyncThunk(
  'comments/fetch',
  async (params: { postId: string }, { rejectWithValue }) => {
    const res = await refreshAPI(`/api/posts/${params.postId}/comments`);
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
  },
);

export const addComment = createAsyncThunk(
  'comments/add',
  async (params: { postId: string; content: string }, { rejectWithValue }) => {
    const res = await refreshAPI(`/api/posts/${params.postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: params.content }),
    });
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
  },
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (id: string, { rejectWithValue }) => {
    const res = await refreshAPI(`/api/comments/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    return id;
  },
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments(state) {
      state.list = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchComments.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
      state.status = 'succeeded';
      state.list = action.payload;
    });
    builder.addCase(fetchComments.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // the API returns comments newest-first, so a new one goes on the front
    builder.addCase(addComment.fulfilled, (state, action: PayloadAction<Comment>) => {
      state.list.unshift(action.payload);
    });
    builder.addCase(addComment.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(deleteComment.fulfilled, (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((c) => c.id !== action.payload);
    });
    builder.addCase(deleteComment.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  }
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;

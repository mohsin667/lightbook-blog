import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TopAuthor, User, UserSummary } from '../../types';
import refreshAPI from '../../api/refreshAPI';

interface UsersState {
  /** Full user records, admin-only — from GET /api/admin/users. */
  list: User[];
  /** The public profile currently being viewed on ProfilePage. */
  profile: UserSummary | null;
  topAuthors: TopAuthor[];
  currentRole: 'user' | 'admin';
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UsersState = {
  list: [],
  profile: null,
  topAuthors: [],
  currentRole: 'user',
  status: 'idle',
  error: null,
};

export const getUserProfile = createAsyncThunk(
  'users/getProfile',
  async (params: { id: string }, { rejectWithValue }) => {
    const res = await refreshAPI(`/api/users/${params.id}`);
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
  },
);

export const getTopAuthors = createAsyncThunk(
  'users/getTopAuthors',
  async (_, { rejectWithValue }) => {
    const res = await refreshAPI('/api/authors/top');
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
  },
);

/** Admin-only: the full user list, including email and ban status. */
export const getAllUsers = createAsyncThunk(
  'users/getAll',
  async (_, { rejectWithValue }) => {
    const res = await refreshAPI('/api/admin/users');
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
  },
);

export const toggleRestrictUser = createAsyncThunk(
  'users/toggleRestrict',
  async (params: { id: string; banned: boolean }, { rejectWithValue }) => {
    const res = await refreshAPI(`/api/users/${params.id}/ban?banned=${params.banned}`, {
      method: 'PATCH',
    });
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
  },
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    const res = await refreshAPI(`/api/users/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    return id;
  },
);

export const followUser = createAsyncThunk(
  'users/follow',
  async (params: { id: string; following: boolean }, { rejectWithValue }) => {
    const res = await refreshAPI(`/api/users/${params.id}/follow`, {
      method: params.following ? 'DELETE' : 'POST',
    });
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return { id: params.id, ...result };
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Purely a client-side "view as" switch for admins — it does not change the
    // user's real role, which only ever comes from the server on /api/auth/me.
    toggleRole(state) {
      state.currentRole = state.currentRole === 'admin' ? 'user' : 'admin';
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserProfile.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.profile = null;
    });
    builder.addCase(getUserProfile.fulfilled, (state, action: PayloadAction<UserSummary>) => {
      state.status = 'succeeded';
      state.profile = action.payload;
    });
    builder.addCase(getUserProfile.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    builder.addCase(getTopAuthors.fulfilled, (state, action: PayloadAction<TopAuthor[]>) => {
      state.topAuthors = action.payload;
    });

    builder.addCase(getAllUsers.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(getAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.status = 'succeeded';
      state.list = action.payload;
    });
    builder.addCase(getAllUsers.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    builder.addCase(toggleRestrictUser.fulfilled, (state, action: PayloadAction<User>) => {
      const i = state.list.findIndex((u) => u.id === action.payload.id);
      if (i !== -1) state.list[i] = action.payload;
    });
    builder.addCase(toggleRestrictUser.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((u) => u.id !== action.payload);
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(
      followUser.fulfilled,
      (state, action: PayloadAction<{ id: string; follower_count: number }>) => {
        if (state.profile?.id === action.payload.id) {
          state.profile.follower_count = action.payload.follower_count;
        }
      },
    );
  }
});

export const { toggleRole } = usersSlice.actions;
export default usersSlice.reducer;

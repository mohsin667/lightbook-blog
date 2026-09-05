import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { users as initialUsers, type User } from '../../data/mockData';
import refreshAPI from '../../api/refreshAPI';

interface UsersState {
  list: User[];
  currentRole: 'user' | 'admin';
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UsersState = {
  list: initialUsers,
  currentRole: 'user',
  status: 'idle',
  error: null,
};

export const getAuthors = createAsyncThunk('users/getAuthors', async (_, { rejectWithValue }) => {
  const res = await refreshAPI(`/api/users`);
  if (!res.ok) {
    return rejectWithValue((await res.json()).detail);
  }
  const result = await res.json();
  return result;
});

// Every reducer below is an intentional no-op — see postsSlice.ts for why.
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    toggleRole(_state) {
      // TODO: implement
    },
    toggleRestrictUser(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
    deleteUser(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
    updateProfile(_state, _action: PayloadAction<{ name: string; bio: string }>) {
      // TODO: implement
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAuthors.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(getAuthors.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.status = 'succeeded';
      state.list = action.payload;
    });
    builder.addCase(getAuthors.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });
  }
});

export const { toggleRole, toggleRestrictUser, deleteUser, updateProfile } = usersSlice.actions;
export default usersSlice.reducer;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { users as initialUsers, type User } from '../../data/mockData';

interface UsersState {
  list: User[];
  currentRole: 'user' | 'admin';
}

const initialState: UsersState = {
  list: initialUsers,
  currentRole: 'user',
};

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
});

export const { toggleRole, toggleRestrictUser, deleteUser, updateProfile } = usersSlice.actions;
export default usersSlice.reducer;

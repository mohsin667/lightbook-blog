import { configureStore } from '@reduxjs/toolkit';
import postsReducer from '../features/posts/postsSlice';
import usersReducer from '../features/users/usersSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import toastReducer from '../features/toast/toastSlice';
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    users: usersReducer,
    categories: categoriesReducer,
    toast: toastReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['toast/showToast'],
        ignoredPaths: ['toast.toasts'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

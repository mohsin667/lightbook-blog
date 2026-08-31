import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import type { LucideIcon } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  icon?: LucideIcon;
}

interface ToastState {
  toasts: ToastItem[];
}

const initialState: ToastState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: {
      reducer(state, action: PayloadAction<ToastItem>) {
        state.toasts.push(action.payload);
      },
      prepare(message: string, icon?: LucideIcon) {
        return { payload: { id: nanoid(), message, icon } };
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { showToast, dismissToast } = toastSlice.actions;
export default toastSlice.reducer;

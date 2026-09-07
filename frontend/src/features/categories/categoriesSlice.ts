import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '../../types';
import refreshAPI from '../../api/refreshAPI';

interface CategoriesState {
  list: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoriesState = {
  list: [],
  status: 'idle',
  error: null,
};

export const fetchCategories = createAsyncThunk('categories/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await refreshAPI('/api/categories');

    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }

    const result = await res.json();
    return result;
  } catch (error) {
    return rejectWithValue('Failed to fetch categories');
  }
})

export const addCategory = createAsyncThunk(
  'categories/add',
  async (name: string, { rejectWithValue }) => {
    const res = await refreshAPI('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
  },
);

export const renameCategory = createAsyncThunk(
  'categories/rename',
  async (params: { id: string; name: string }, { rejectWithValue }) => {
    const res = await refreshAPI(`/api/categories/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: params.name }),
    });
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    const result = await res.json();
    return result;
  },
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string, { rejectWithValue }) => {
    const res = await refreshAPI(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      return rejectWithValue((await res.json()).detail);
    }
    return id;
  },
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
      state.status = 'succeeded';
      state.list = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });

    builder.addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
      state.list.push(action.payload);
    });
    builder.addCase(addCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(renameCategory.fulfilled, (state, action: PayloadAction<Category>) => {
      const i = state.list.findIndex((c) => c.id === action.payload.id);
      if (i !== -1) state.list[i] = action.payload;
    });

    builder.addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((c) => c.id !== action.payload);
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  }
});

export default categoriesSlice.reducer;

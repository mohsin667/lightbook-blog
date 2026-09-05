import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { categories as initialCategories, type Category } from '../../data/mockData';
import refreshAPI from '../../api/refreshAPI';

interface CategoriesState {
  list: Category[];
}

const initialState: CategoriesState = {
  list: initialCategories,
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

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
    deleteCategory(_state, _action: PayloadAction<string>) {
      // TODO: implement
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
      state.list = action.payload;
    })
  }
});

export const { addCategory, deleteCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;

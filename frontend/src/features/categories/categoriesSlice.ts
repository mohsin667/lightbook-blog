import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { categories as initialCategories, type Category } from '../../data/mockData';

interface CategoriesState {
  list: Category[];
}

const initialState: CategoriesState = {
  list: initialCategories,
};

// Every reducer below is an intentional no-op — see postsSlice.ts for why.
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
});

export const { addCategory, deleteCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;

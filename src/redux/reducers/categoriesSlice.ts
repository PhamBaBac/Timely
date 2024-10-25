import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { CategoryModel } from '../../models/categoryModel';

interface CategoriesState {
  categories: CategoryModel[];
}

const initialState: CategoriesState = {
  categories: [],
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<CategoryModel[]>) {
      state.categories = action.payload;
    },
  },
});

export const {setCategories} = categoriesSlice.actions;
export default categoriesSlice.reducer;

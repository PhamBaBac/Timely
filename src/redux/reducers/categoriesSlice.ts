import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CategoryModel} from '../../models/categoryModel';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface CategoriesState {
  categories: CategoryModel[];
}

const initialState: CategoriesState = {
  categories: [
   
  ],
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<CategoryModel[]>) {
      state.categories = action.payload;
    },
    deleteCategory(state, action: PayloadAction<string>) {
      state.categories = state.categories.filter(
        category => category.name !== action.payload,
      );
    },
  },
});

export const {setCategories, deleteCategory} = categoriesSlice.actions;
export default categoriesSlice.reducer;

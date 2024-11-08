import {configureStore} from '@reduxjs/toolkit';
import tasksReducer from '../redux/reducers/tasksSlice';
import categoriesReducer from '../redux/reducers/categoriesSlice';

const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

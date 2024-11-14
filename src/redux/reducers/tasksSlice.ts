import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { TaskModel } from '../../models/taskModel';

interface TasksState {
  tasks: TaskModel[];
  deletedTaskIds: string[];
  completedTasks: {[key: string]: boolean};
  isImportantTasks: {[key: string]: boolean};
}

const initialState: TasksState = {
  tasks: [],
  deletedTaskIds: [],
  completedTasks: {},
  isImportantTasks: {},
  
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<TaskModel[]>) {
      state.tasks = action.payload;
    },
    addTask(state, action: PayloadAction<TaskModel>) {
      state.tasks.push(action.payload);
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.deletedTaskIds.push(action.payload);
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    deleteAllTasks(state) {
      state.deletedTaskIds = state.tasks.map(task => task.id);
      state.tasks = [];
    },
    deleteMultipleTasks(state, action: PayloadAction<string[]>) {
      state.deletedTaskIds = state.deletedTaskIds.concat(action.payload);
      state.tasks = state.tasks.filter(task => !action.payload.includes(task.id));
    },

    setDeletedTaskIds(state, action: PayloadAction<string[]>) {
      state.deletedTaskIds = action.payload;
    },
    setCompletedTasks(state, action: PayloadAction<{[key: string]: boolean}>) {
      state.completedTasks = action.payload;
    },
    setImportantTasks(state, action: PayloadAction<{[key: string]: boolean}>) {
      state.isImportantTasks = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  deleteTask,
  deleteAllTasks,
  deleteMultipleTasks,
  setDeletedTaskIds,
  setCompletedTasks,
  setImportantTasks,
} = tasksSlice.actions;
export default tasksSlice.reducer;

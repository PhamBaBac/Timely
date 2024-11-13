import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { ScheduleModel } from '../../models/scheduleModel';

interface ScheduleState {
  schedules: ScheduleModel[];
}

const initialState: ScheduleState = {
  schedules: [],
};


const scheduleSlice = createSlice({
  name: 'schedules',
  initialState,
  reducers: {
    setSchedules(state, action: PayloadAction<ScheduleModel[]>) {
      state.schedules = action.payload;
    },
  },
});


export const {setSchedules} = scheduleSlice.actions;
export default scheduleSlice.reducer;
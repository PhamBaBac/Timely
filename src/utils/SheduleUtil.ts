import {Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Dispatch} from 'redux';
import {setSchedules} from '../redux/reducers/ScheduleaSlice';
import {ScheduleModel} from '../models/scheduleModel';

export const fetchSchedules = async (dispatch: Dispatch) => {
  try {
    const schedulesSnapshot = await firestore().collection('schedules').get();
    const schedules = schedulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ScheduleModel[];
    
    // Chuyển đổi các trường ngày thành Date objects
    const formattedSchedules = schedules.map(schedule => ({
      ...schedule,
      day: schedule.day ? new Date(schedule.day) : new Date(),
      startDate: schedule.startDate ? new Date(schedule.startDate) : new Date(),
      endDate: schedule.endDate ? new Date(schedule.endDate) : new Date(),
    }));

    dispatch(setSchedules(formattedSchedules));
  } catch (error) {
    console.error('Error fetching schedules: ', error);
  }
};

export const handleAddSchedule = async (
  schedule: Omit<ScheduleModel, 'id'>,
  dispatch: Dispatch,
) => {
  try {
    const scheduleRef = await firestore().collection('schedules').add({
      ...schedule,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const newSchedule = {
      id: scheduleRef.id,
      ...schedule,
    };

    // Fetch lại toàn bộ schedules để cập nhật state
    await fetchSchedules(dispatch);

    return newSchedule;
  } catch (error) {
    console.error('Error adding schedule: ', error);
    Alert.alert('Lỗi', 'Không thể thêm lịch học. Vui lòng thử lại sau.');
    return null;
  }
};

export const handleUpdateSchedule = async (
  scheduleId: string,
  updatedData: Partial<ScheduleModel>,
  schedules: ScheduleModel[],
  dispatch: Dispatch,
) => {
  try {
    const scheduleRef = firestore().collection('schedules').doc(scheduleId);
    await scheduleRef.update({
      ...updatedData,
      updatedAt: Date.now(),
    });

    // Cập nhật lại state cho schedule đã thay đổi
    const updatedSchedules = schedules.map(schedule =>
      schedule.id === scheduleId
        ? {
            ...schedule,
            ...updatedData,
            updatedAt: Date.now(),
          }
        : schedule,
    );

    dispatch(setSchedules(updatedSchedules));
  } catch (error) {
    console.error('Error updating schedule: ', error);
    Alert.alert('Lỗi', 'Không thể cập nhật lịch học. Vui lòng thử lại sau.');
  }
};

export const handleDeleteSchedule = async (
  scheduleId: string,
  dispatch: Dispatch,
) => {
  Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa lịch học này?', [
    {text: 'Hủy', style: 'cancel'},
    {
      text: 'Xóa',
      style: 'destructive',
      onPress: async () => {
        try {
          await firestore().collection('schedules').doc(scheduleId).delete();
          
          // Fetch lại toàn bộ schedules để cập nhật state
          await fetchSchedules(dispatch);
        } catch (error) {
          console.error('Error deleting schedule: ', error);
          Alert.alert('Lỗi', 'Không thể xóa lịch học. Vui lòng thử lại sau.');
        }
      },
    },
  ]);
};

export const handleToggleExam = async (
  scheduleId: string,
  schedules: ScheduleModel[],
  dispatch: Dispatch,
) => {
  try {
    const scheduleRef = firestore().collection('schedules').doc(scheduleId);
    const scheduleDoc = await scheduleRef.get();
    
    if (scheduleDoc.exists) {
      const currentExam = scheduleDoc.data()?.isExam || false;
      await scheduleRef.update({
        isExam: !currentExam,
        updatedAt: Date.now(),
      });

      // Cập nhật lại state cho schedule đã thay đổi
      const updatedSchedules = schedules.map(schedule =>
        schedule.id === scheduleId
          ? {...schedule, isExam: !currentExam, updatedAt: Date.now()}
          : schedule,
      );
      
      dispatch(setSchedules(updatedSchedules));
    }
  } catch (error) {
    console.error('Error updating schedule exam status: ', error);
    Alert.alert('Lỗi', 'Không thể cập nhật trạng thái kỳ thi. Vui lòng thử lại sau.');
  }
};
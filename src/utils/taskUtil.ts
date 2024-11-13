import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {Dispatch} from 'redux';
import {
  setDeletedTaskIds,
  deleteTask,
  setCompletedTasks,
  setTasks,
  setImportantTasks,
} from '../redux/reducers/tasksSlice';
import {TaskModel} from '../models/taskModel';

export const fetchDeletedTasks = async (dispatch: Dispatch) => {
  const storedDeletedTasks = await AsyncStorage.getItem('deletedTasks');
  if (storedDeletedTasks) {
    const parsedDeletedTasks = JSON.parse(storedDeletedTasks);
    dispatch(setDeletedTaskIds(parsedDeletedTasks || []));
  }
};

export const fetchCompletedTasks = async (dispatch: Dispatch) => {
  const storedCompletedTasks = await AsyncStorage.getItem('completedTasks');
  if (storedCompletedTasks) {
    const parsedCompletedTasks = JSON.parse(storedCompletedTasks);
    dispatch(setCompletedTasks(parsedCompletedTasks || {}));
  }
};

export const fetchImportantTasks = async (dispatch: Dispatch) => {
  const storedImportantTasks = await AsyncStorage.getItem('importantTasks');
  if (storedImportantTasks) {
    const parsedImportantTasks = JSON.parse(storedImportantTasks);
    dispatch(setImportantTasks(parsedImportantTasks || {}));
  }
};



export const handleDeleteTask = async (
  taskId: string,
  dispatch: Dispatch,
  repeatCount: number = 0,
) => {
  Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa nhiệm vụ này?', [
    {text: 'Hủy', style: 'cancel'},
    {
      text: 'Xóa',
      style: 'destructive',
      onPress: async () => {
        try {
          if (taskId.includes('-')) {
            const existingDeletedTasks = await AsyncStorage.getItem(
              'deletedTasks',
            );
            const deletedTasks = existingDeletedTasks
              ? JSON.parse(existingDeletedTasks)
              : [];

            const updatedDeletedTasks = Array.from(
              new Set([...deletedTasks, taskId]),
            );

            await AsyncStorage.setItem(
              'deletedTasks',
              JSON.stringify(updatedDeletedTasks),
            );

            dispatch(setDeletedTaskIds(updatedDeletedTasks));
            dispatch(deleteTask(taskId));

            const remainingTasks: string[] = deletedTasks.filter((id: string) => id.startsWith(taskId.split('-')[0]));

            if (remainingTasks.length === repeatCount - 1) {
              await firestore().collection('tasks').doc(taskId.split('-')[0]).delete();
            }
          } else {
            await firestore().collection('tasks').doc(taskId).delete();
            dispatch(deleteTask(taskId));
          }
        } catch (error) {
          console.error('Error deleting task: ', error);
        }
      },
    },
  ]);
};

export const handleDeleteAllTasks = async (tasks: TaskModel[], dispatch: Dispatch) => {
  Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa tất cả nhiệm vụ?', [
    {text: 'Hủy', style: 'cancel'},
    {
      text: 'Xóa',
      style: 'destructive',
      onPress: async () => {
        try {
          const deletedTasks = tasks.map(task => task.id);
          await AsyncStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
          dispatch(setDeletedTaskIds(deletedTasks));
          dispatch(setTasks([]));
          await firestore().collection('tasks').get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
              doc.ref.delete();
            });
          });
        } catch (error) {
          console.error('Error deleting all tasks: ', error);
        }
      },
    },
  ]);
}

// Xoa nhieu task cung luc khi chon checkbox

export const handleDeleteMultipleTasks = async (
  tasks: TaskModel[],
  selectedTaskIds: string[],
  dispatch: Dispatch,
) => {
  Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa các nhiệm vụ đã chọn?', [
    {text: 'Hủy', style: 'cancel'},
    {
      text: 'Xóa',
      style: 'destructive',
      onPress: async () => {
        try {
          const deletedTasks = tasks
            .filter(task => selectedTaskIds.includes(task.id))
            .map(task => task.id);
          await AsyncStorage.setItem(
            'deletedTasks',
            JSON.stringify([...deletedTasks]),
          );
          dispatch(setDeletedTaskIds([...deletedTasks]));
          dispatch(setTasks(tasks.filter(task => !selectedTaskIds.includes(task.id))));
          await Promise.all(
            deletedTasks.map(async taskId => {
              if (taskId.includes('-')) {
                const remainingTasks: string[] = deletedTasks.filter((id: string) => id.startsWith(taskId.split('-')[0]));
                if (remainingTasks.length === 1) {
                  await firestore().collection('tasks').doc(taskId.split('-')[0]).delete();
                }
              } else {
                await firestore().collection('tasks').doc(taskId).delete();
              }
            }),
          );
        } catch (error) {
          console.error('Error deleting multiple tasks: ', error);
        }
      },
    },
  ]);
};

export const handleToggleComplete = async (
  taskId: string,
  tasks: TaskModel[],
  dispatch: Dispatch,
) => {
  try {
    const updatedAt = Date.now(); // Lấy thời gian hiện tại

    if (taskId.includes('-')) {
      // Task lặp lại (có chứa '-')
      const updatedTasks = tasks.map(task =>
        task.id === taskId
          ? {...task, isCompleted: !task.isCompleted, updatedAt}
          : task,
      );
      dispatch(setTasks(updatedTasks)); // Cập nhật tasks trong Redux

      // Lưu trạng thái vào AsyncStorage
      const existingCompletedTasks = await AsyncStorage.getItem(
        'completedTasks',
      );
      const completedTasks = existingCompletedTasks
        ? JSON.parse(existingCompletedTasks)
        : {};

      // Cập nhật taskId với trạng thái mới
      const updatedCompletedTasks = {
        ...completedTasks,
        [taskId]: !completedTasks[taskId], // Toggle trạng thái isCompleted
      };
      await AsyncStorage.setItem(
        'completedTasks',
        JSON.stringify(updatedCompletedTasks),
      );

      // Cập nhật completedTasks trong Redux
      dispatch(setCompletedTasks(updatedCompletedTasks));
    } else {
      // Task bình thường lưu trữ trên Firestore
      const taskRef = firestore().collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();
      if (taskDoc.exists) {
        const currentCompleted = taskDoc.data()?.isCompleted || false;
        await taskRef.update({
          isCompleted: !currentCompleted,
          updatedAt,
        });

        // Cập nhật lại state cho task đã thay đổi trong Redux
        const updatedTasks = tasks.map(task =>
          task.id === taskId
            ? {...task, isCompleted: !currentCompleted, updatedAt}
            : task,
        );
        dispatch(setTasks(updatedTasks));
      }
    }
  } catch (error) {
    console.error('Error updating task completion status: ', error);
  }
};

export const handleToggleImportant = async (
  taskId: string,
  tasks: TaskModel[],
  dispatch: Dispatch,
) => {
  try {
    if (taskId.includes('-')) {
      // Task lặp lại (có chứa '-')
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? {...task, isImportant: !task.isImportant} : task,
      );
      dispatch(setTasks(updatedTasks)); // Cập nhật tasks trong Redux

      // Lưu trạng thái vào AsyncStorage
      const existingImportantTasks = await AsyncStorage.getItem(
        'importantTasks',
      );
      const importantTasks = existingImportantTasks
        ? JSON.parse(existingImportantTasks)
        : {};

      // Cập nhật taskId với trạng thái mới
      const updatedImportantTasks = {
        ...importantTasks,
        [taskId]: !importantTasks[taskId], // Toggle trạng thái isImportant
      };
      await AsyncStorage.setItem(
        'importantTasks',
        JSON.stringify(updatedImportantTasks),
      );

      // Cập nhật importantTasks trong Redux
      dispatch(setImportantTasks(updatedImportantTasks));
    } else {
      // Task bình thường lưu trữ trên Firestore
      const taskRef = firestore().collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();
      if (taskDoc.exists) {
        const currentImportant = taskDoc.data()?.isImportant || false;
        await taskRef.update({
          isImportant: !currentImportant,
        });

        // Cập nhật lại state cho task đã thay đổi trong Redux
        const updatedTasks = tasks.map(task =>
          task.id === taskId ? {...task, isImportant: !currentImportant} : task,
        );
        dispatch(setTasks(updatedTasks));
      }
    }
  } catch (error) {
    console.error('Error updating task importance status: ', error);
  }
};

export const handleUpdateRepeat = async (
  taskId: string
) => {
  try {
    const originalTaskId = taskId.split('-')[0];
    const taskRef = firestore().collection('tasks').doc(originalTaskId);
    const taskDoc = await taskRef.get();

    if (taskDoc.exists) {
      const currentRepeat = taskDoc.data()?.repeat as 'no' | 'day' | 'week' | 'month' || 'no';
      const nextRepeat: 'no' | 'day' | 'week' | 'month' = currentRepeat === 'no' ? 'day' : 'no';
      await taskRef.update({
        repeat: nextRepeat,
      });
    }
  } catch (error) {
    console.error('Error updating task repeat: ', error);
  }
};
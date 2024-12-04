import {Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';

import {TaskModel} from '../models/taskModel';
import firebase from '@react-native-firebase/app';


export const handleToggleCompleteTask = async (taskId: string) => {
  try {
    const taskRef = firestore().collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    if (taskDoc.exists) {
      const taskData = taskDoc.data() as TaskModel;
      await taskRef.update({
        isCompleted: !taskData.isCompleted,
        updatedAt:new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error toggling complete task: ', error);
  }
};

export const handleHighlight = async (taskId: string) => {
  try {
    const taskRef = firestore().collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    if (taskDoc.exists) {
      const taskData = taskDoc.data() as TaskModel;
      await taskRef.update({isImportant: !taskData.isImportant});
    }
  } catch (error) {
    console.error('Error toggling complete task: ', error);
  }
};

export const handleUpdateRepeatTask = async (taskId: string, taskName: string) => {
  Alert.alert(
    'Xác nhận',
    `Bạn có chắc chắn muốn hủy bỏ lặp lại cho task?`,
    [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Đồng ý',
        onPress: async () => {
          try {
            const tasksSnapshot = await firestore()
              .collection('tasks')
              .where('title', '==', taskName) // Giả sử `title` là trường lưu tên task
              .get();

            const batch = firestore().batch(); // Sử dụng batch để xử lý đồng thời

            tasksSnapshot.forEach(doc => {
              // Xóa tất cả task trừ task với taskId
              if (doc.id !== taskId) {
                batch.delete(doc.ref);
              }
            });

            // Cập nhật task với taskId thành repeat = 'no'
            const taskRef = firestore().collection('tasks').doc(taskId);
            batch.update(taskRef, {repeat: 'no'});

            // Commit batch
            await batch.commit();

            console.log(`Đã hủy lặp lại cho task "${taskName}".`);
          } catch (error) {
            console.error('Lỗi khi cập nhật task lặp lại:', error);
          }
        },
      },
    ],
    {cancelable: true}, // Cho phép đóng alert bằng cách bấm ra ngoài
  );
};


export const handleDelete = async (taskId: string) => {
  Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa nhiệm vụ này?', [
    {text: 'Hủy', style: 'cancel'},
    {
      text: 'Xóa',
      style: 'destructive',
      onPress: async () => {
        try {
          await firestore().collection('tasks').doc(taskId).delete();
        } catch (error) {
          console.error('Error deleting task: ', error);
        }
      },
    },
  ]);
};


export const fetchTasks = (
  uid: string,
  setTasks: React.Dispatch<React.SetStateAction<TaskModel[]>>,
) => {
  return firestore()
    .collection('tasks')
    .where('uid', '==', uid)
    .onSnapshot(snapshot => {
      const tasksList = snapshot.docs.map(doc => {
        const taskData = doc.data() as TaskModel;

        // Chuyển đổi dueDate, startTime, endDate nếu là Timestamp
        const dueDate =
          taskData.dueDate instanceof firebase.firestore.Timestamp
            ? taskData.dueDate.toDate().toISOString()
            : taskData.dueDate;

        const startTime =
          taskData.startTime instanceof firebase.firestore.Timestamp
            ? taskData.startTime.toDate().toISOString()
            : taskData.startTime;

        const endDate =
          taskData.endDate instanceof firebase.firestore.Timestamp
            ? taskData.endDate.toDate().toISOString()
            : taskData.endDate;

        return {
          ...taskData,
          id: doc.id,
          dueDate,
          startTime,
          endDate,
        } as TaskModel;
      });

      setTasks(tasksList);
    });
};


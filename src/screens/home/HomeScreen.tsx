import React, {useEffect, useState} from 'react';
import {View, ScrollView, StyleSheet, Alert} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {appColors} from '../../constants/appColor';
import HeaderComponent from '../../components/HeaderComponent';
import FilterComponent from '../../components/FilterComponent';
import TaskItemComponent from '../../components/TaskItemComponent';
import {CategoryModel} from '../../models/categoryModel';
import {TaskModel} from '../../models/taskModel';
import {addDays, addMonths, addWeeks, format} from 'date-fns';

const HomeScreen = ({navigation}: {navigation: any}) => {
  const user = auth().currentUser;
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [deletedTaskIds, setDeletedTaskIds] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const categoriesList = snapshot.docs.map(
          doc => doc.data() as CategoryModel,
        );
        setCategories(categoriesList);
      });
    return () => unsubscribe();
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'Tất cả') return true;
    return task.category === activeFilter;
  });

  useEffect(() => {
    const fetchDeletedTasks = async () => {
      const storedDeletedTasks = await AsyncStorage.getItem('deletedTasks');
      if (storedDeletedTasks) {
        const parsedDeletedTasks = JSON.parse(storedDeletedTasks);
        setDeletedTaskIds(parsedDeletedTasks || []);
      }
    };

    fetchDeletedTasks();
  }, []);

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      const storedCompletedTasks = await AsyncStorage.getItem('completedTasks');
      if (storedCompletedTasks) {
        const parsedCompletedTasks = JSON.parse(storedCompletedTasks);
        setCompletedTasks(parsedCompletedTasks || {});
      }
    };

    fetchCompletedTasks();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const tasksList = snapshot.docs.map(
          doc => ({id: doc.id, ...doc.data()} as TaskModel),
        );

        const allTasksWithRepeats = tasksList.flatMap(task => {
          if (task.repeat === 'no' || !task.repeat || !task.startDate) {
            return [task];
          }

          const repeatedDates = calculateRepeatedDates(
            task.startDate,
            task.repeat as 'day' | 'week' | 'month',
            7,
          );

          return repeatedDates.map(date => ({
            ...task,
            id: `${task.id}-${date}`,
            startDate: date,
          }));
        });

        // Lọc nhiệm vụ đã xóa khỏi danh sách
        const filteredTasks = allTasksWithRepeats.filter(
          task => !deletedTaskIds.includes(task.id),
        );

        // Khôi phục trạng thái isCompleted từ AsyncStorage
        const restoredTasks = filteredTasks.map(task => ({
          ...task,
          isCompleted: completedTasks[task.id] || task.isCompleted,
        }));

        // Cập nhật trạng thái với danh sách nhiệm vụ đã lọc và khôi phục
        setTasks(restoredTasks);
      });

    return () => unsubscribe();
  }, [user, deletedTaskIds, completedTasks]); // Theo dõi cả user, deletedTaskIds và completedTasks

  const handleDelete = async (taskId: string) => {
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

              // Loại bỏ trùng lặp trước khi lưu
              const updatedDeletedTasks = Array.from(
                new Set([...deletedTasks, taskId]),
              );

              await AsyncStorage.setItem(
                'deletedTasks',
                JSON.stringify(updatedDeletedTasks),
              );
              console.log('Updated deleted tasks:', updatedDeletedTasks);

              // Cập nhật deletedTaskIds
              setDeletedTaskIds(updatedDeletedTasks); // Cập nhật state nhưng không kích hoạt lại useEffect

              // Loại bỏ task khỏi UI
              setTasks(prevTasks =>
                prevTasks.filter(task => task.id !== taskId),
              );
            } else {
              await firestore().collection('tasks').doc(taskId).delete();
              console.log('Deleted task from Firebase:', taskId);
            }
          } catch (error) {
            console.error('Error deleting task: ', error);
          }
        },
      },
    ]);
  };
  const handleToggleComplete = async (taskId: string) => {
    try {
      if (taskId.includes('-')) {
        // Task lặp lại (có chứa '-')
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId
              ? {...task, isCompleted: !task.isCompleted}
              : task,
          ),
        );

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
      } else {
        // Task bình thường lưu trữ trên Firestore
        const taskRef = firestore().collection('tasks').doc(taskId);
        const taskDoc = await taskRef.get();

        if (taskDoc.exists) {
          const currentCompleted = taskDoc.data()?.isCompleted || false;
          await taskRef.update({
            isCompleted: !currentCompleted,
          });

          // Cập nhật lại state cho task đã thay đổi
          setTasks(prevTasks =>
            prevTasks.map(task =>
              task.id === taskId
                ? {...task, isCompleted: !currentCompleted}
                : task,
            ),
          );
        }
      }
    } catch (error) {
      console.error('Error updating task completion status: ', error);
    }
  };

  const calculateRepeatedDates = (
    startDate: string,
    repeat: 'day' | 'week' | 'month',
    count: number,
  ) => {
    const dates = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
      dates.push(currentDate.toISOString());

      if (repeat === 'day') {
        currentDate = addDays(currentDate, 1);
      } else if (repeat === 'week') {
        currentDate = addWeeks(currentDate, 1);
      } else if (repeat === 'month') {
        currentDate = addMonths(currentDate, 1);
      }
    }

    return dates;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const tasksBeforeToday = filteredTasks.filter(task => {
    const taskStartDate = new Date(task.startDate || '');
    taskStartDate.setHours(0, 0, 0, 0);
    return taskStartDate < today;
  });

  const sortedTasksBeforeToday = tasksBeforeToday.sort((a, b) => {
    const dateA = new Date(a.startDate || '').getTime();
    const dateB = new Date(b.startDate || '').getTime();
    return dateB - dateA;
  });

  const uniqueTasksBeforeTodayMap = new Map<string, TaskModel>();

  sortedTasksBeforeToday.forEach(task => {
    if (!uniqueTasksBeforeTodayMap.has(task.description)) {
      uniqueTasksBeforeTodayMap.set(task.description, task);
    }
  });

  const uniqueTasksBeforeToday = Array.from(uniqueTasksBeforeTodayMap.values());

  const tasksToday = filteredTasks.filter(task => {
    const taskStartDate = new Date(task.startDate || '');
    taskStartDate.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00
    return taskStartDate.getTime() === today.getTime();
  });

  const tasksAfterToday = filteredTasks.filter(task => {
    const taskStartDate = new Date(task.startDate || '');
    taskStartDate.setHours(0, 0, 0, 0);
    return taskStartDate > today; // Task is after today
  });

  const sortedTasks = tasksAfterToday.sort((a, b) => {
    const dateA = new Date(a.startDate || '').getTime();
    const dateB = new Date(b.startDate || '').getTime();
    return dateA - dateB;
  });
  const uniqueTasksMap = new Map<string, TaskModel>();

  sortedTasks.forEach(task => {
    if (!uniqueTasksMap.has(task.description)) {
      uniqueTasksMap.set(task.description, task);
    }
  });

  const uniqueTasks = Array.from(uniqueTasksMap.values());

  const handleHighlight = async (taskId: string) => {
    try {
      const originalTaskId = taskId.split('-')[0];
      const taskRef = firestore().collection('tasks').doc(originalTaskId);
      const taskDoc = await taskRef.get();

      if (taskDoc.exists) {
        const currentIsImportant = taskDoc.data()?.isImportant;
        await taskRef.update({
          isImportant: !currentIsImportant,
        });
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id.startsWith(originalTaskId)
              ? {...task, isImportant: !currentIsImportant}
              : task,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  };

  const handleUpdateRepeat = async (taskId: string) => {
    try {
      const originalTaskId = taskId.split('-')[0];
      const taskRef = firestore().collection('tasks').doc(originalTaskId);
      const taskDoc = await taskRef.get();

      if (taskDoc.exists) {
        const currentRepeat = taskDoc.data()?.repeat || 'no';
        const nextRepeat = currentRepeat === 'no' ? 'day' : 'no';
        await taskRef.update({
          repeat: nextRepeat,
        });
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id.startsWith(originalTaskId)
              ? {...task, repeat: nextRepeat}
              : task,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating task repeat: ', error);
    }
  };

  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('TaskDetailScreen', {task: task});
  };

  const filters = categories.reduce(
    (acc, category) => {
      if (!acc.includes(category.name)) {
        acc.push(category.name);
      }
      return acc;
    },
    ['Tất cả', 'Công việc', 'Sinh nhật', 'Cá nhân', 'Gia đình'],
  );

  return (
    <View style={styles.container}>
      <HeaderComponent
        title="Trang chủ"
        onMenuPress={() => navigation.openDrawer()}
        onSearchPress={() => {
          /* Xử lý tìm kiếm */
        }}
      />

      <FilterComponent
        filters={filters}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onCategoryPress={() => navigation.navigate('Category')}
      />

      <ScrollView style={styles.tasksContainer}>
        {tasks.map(task => (
          <TaskItemComponent
            key={task.id}
            item={{
              ...task,
              startTime: task.startTime
                ? formatTime(new Date(task.startTime))
                : '',
            }}
            onToggleComplete={handleToggleComplete}
            onHighlight={handleHighlight}
            onDelete={handleDelete}
            onUpdateRepeat={handleUpdateRepeat}
            onPress={handleTaskPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.whitesmoke,
    paddingHorizontal: 10,
  },
  tasksContainer: {
    flex: 1,
  },
});

export default HomeScreen;

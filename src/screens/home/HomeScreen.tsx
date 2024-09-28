import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SpaceComponent} from '../../components';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {appColors} from '../../constants/appColor';
import {TaskModel} from '../../models/taskModel';
import {CategoryModel} from '../../models/categoryModel';
import {DateTime} from '../../utils/DateTime';

const HomeScreen = ({navigation}: {navigation: any}) => {
  const user = auth().currentUser;
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [showBeforeToday, setShowBeforeToday] = useState(true);
  const [showToday, setShowToday] = useState(true);
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const tasksList = snapshot.docs.map(
          doc => ({id: doc.id, ...doc.data()} as TaskModel),
        );
        setTasks(tasksList);
      });

    return () => unsubscribe();
  }, []);

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

  const filters = categories.reduce<string[]>(
    (acc, category: CategoryModel) => {
      if (!acc.includes(category.name)) {
        acc.push(category.name);
      }
      return acc;
    },
    ['Tất cả', 'Công việc', 'Sinh nhật'],
  );

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'Tất cả') return true;
    return task.category === activeFilter;
  });

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const tasksList = snapshot.docs.map(
          doc => ({id: doc.id, ...doc.data()} as TaskModel),
        );

        // Lọc ra các task có repeat và tạo các task với ngày lặp lại
        const allTasksWithRepeats = tasksList.flatMap(task => {
          if (task.repeat === 'no' || !task.repeat || !task.startDate) {
            return [task]; // Nếu task có repeat là 'no' hoặc không có repeat, giữ nguyên
          }

          const repeatedDates = calculateRepeatedDates(
            task.startDate,
            task.repeat as 'day' | 'week' | 'month',
            365, // Generate dates up to today
          );
          console.log('repeatedDates', repeatedDates);
          return repeatedDates.map(date => ({
            ...task,
            id: `${task.id}-${date}`,
            startDate: date, 
          }));
        });
        console.log('allTasksWithRepeats', allTasksWithRepeats);

        setTasks(allTasksWithRepeats);
      });

    return () => unsubscribe();
  }, [user]);

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

  // Get today's date in a comparable format
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

const tasksBeforeToday = filteredTasks.filter(task => {
  const taskStartDate = new Date(task.startDate || '');
  taskStartDate.setHours(0, 0, 0, 0); // Đặt giờ của taskStartDate về 00:00:00
  return taskStartDate < today; // Task is before today
});

// Sort tasks by start date
const sortedTasksBeforeToday = tasksBeforeToday.sort((a, b) => {
  const dateA = new Date(a.startDate || '').getTime();
  const dateB = new Date(b.startDate || '').getTime();
  return dateB - dateA;
});

// Use a Map to keep track of the closest task for each unique description
const uniqueTasksBeforeTodayMap = new Map<string, TaskModel>();

sortedTasksBeforeToday.forEach(task => {
  if (!uniqueTasksBeforeTodayMap.has(task.description)) {
    uniqueTasksBeforeTodayMap.set(task.description, task);
  }
});

// Convert the Map values to an array
const uniqueTasksBeforeToday = Array.from(uniqueTasksBeforeTodayMap.values());


  const tasksToday = filteredTasks.filter(task => {
    const taskStartDate = new Date(task.startDate || '');
    taskStartDate.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00
    return taskStartDate.getTime() === today.getTime();
  });

 const tasksAfterToday = filteredTasks.filter(task => {
   const taskStartDate = new Date(task.startDate || '');
   taskStartDate.setHours(0, 0, 0, 0); // Đặt giờ của taskStartDate về 00:00:00
   return taskStartDate > today; // Task is after today
 });

 // Sort tasks by start date
 const sortedTasks = tasksAfterToday.sort((a, b) => {
   const dateA = new Date(a.startDate || '').getTime();
   const dateB = new Date(b.startDate || '').getTime();
   return dateA - dateB;
 });

 // Use a Map to keep track of the closest task for each unique description
 const uniqueTasksMap = new Map<string, TaskModel>();

 sortedTasks.forEach(task => {
   if (!uniqueTasksMap.has(task.description)) {
     uniqueTasksMap.set(task.description, task);
   }
 });

 
 const uniqueTasks = Array.from(uniqueTasksMap.values());


  
  const handleHighlight = async (taskId: string) => {
    try {
      const taskRef = firestore().collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();

      if (taskDoc.exists) {
        const currentIsImportant = taskDoc.data()?.isImportant;
        await taskRef.update({
          isImportant: !currentIsImportant,
        });
      }
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  };

  const handleDelete = (taskId: string) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa nhiệm vụ này?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('tasks').doc(taskId).delete();
            console.log(`Deleted task with id: ${taskId}`);
          } catch (error) {
            console.error('Error deleting task: ', error);
          }
        },
      },
    ]);
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const taskRef = firestore().collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();

      if (taskDoc.exists) {
        const currentCompleted = taskDoc.data()?.isCompleted || false;
        await taskRef.update({
          isCompleted: !currentCompleted,
        });
      }
    } catch (error) {
      console.error('Error updating task completion status: ', error);
    }
  };

  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('TaskDetailScreen', {task: task});
  };

  const renderTask = ({item}: {item: TaskModel}) => {
    if (!item) return null;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <TouchableOpacity onPress={() => handleTaskPress(item)}>
          <View style={styles.taskItem}>
            <TouchableOpacity
              style={styles.roundButton}
              onPress={() => handleToggleComplete(item.id)}>
              {item.isCompleted ? (
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={appColors.primary}
                />
              ) : (
                <MaterialIcons
                  name="radio-button-unchecked"
                  size={24}
                  color={appColors.gray}
                />
              )}
            </TouchableOpacity>
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskTitle,
                  item.isCompleted && styles.completedTaskTitle,
                ]}>
                {item.description}
              </Text>
              <Text style={styles.taskDate}>
                {DateTime.GetDate(new Date(item.startDate || ''))}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={appColors.whitesmoke}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.openDrawer()}>
          <MaterialIcons name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="search" size={24} color={appColors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {filters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter)}>
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter && styles.activeFilterText,
                ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tasksContainer}>
        {tasksBeforeToday.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setShowBeforeToday(!showBeforeToday)}
              style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Trước</Text>
              <MaterialIcons
                name={showBeforeToday ? 'expand-less' : 'expand-more'}
                size={24}
                color={appColors.black}
              />
            </TouchableOpacity>
            {showBeforeToday && (
              <FlatList
                data={tasksBeforeToday}
                keyExtractor={item => item.id}
                renderItem={renderTask}
                contentContainerStyle={styles.flatListContent}
              />
            )}
          </View>
        )}

        {tasksToday.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setShowToday(!showToday)}
              style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Hôm nay </Text>
              <MaterialIcons
                name={showToday ? 'expand-less' : 'expand-more'}
                size={24}
                color={appColors.black}
              />
            </TouchableOpacity>
            {showToday && (
              <FlatList
                data={tasksToday}
                keyExtractor={item => item.id}
                renderItem={renderTask}
                contentContainerStyle={styles.flatListContent}
              />
            )}
          </View>
        )}
        {tasksAfterToday.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setShowBeforeToday(!showBeforeToday)}
              style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Tương lai</Text>
              <MaterialIcons
                name={showBeforeToday ? 'expand-less' : 'expand-more'}
                size={24}
                color={appColors.black}
              />
            </TouchableOpacity>
            {showBeforeToday && (
              <FlatList
                data={tasksAfterToday}
                keyExtractor={item => item.id}
                renderItem={renderTask}
                contentContainerStyle={styles.flatListContent}
              />
            )}
          </View>
        )}
      </View>
      <SpaceComponent height={120} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.whitesmoke,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: appColors.white,
    borderBottomWidth: 1,
    borderBottomColor: appColors.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.black,
  },
  iconButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingBottom: 4,
  },
  filters: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: appColors.lightGray,
    borderRadius: 14,
    marginRight: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: appColors.primary,
  },
  filterButtonText: {
    fontSize: 15,
    color: appColors.gray,
  },
  activeFilterText: {
    color: appColors.white,
  },
  tasksContainer: {
    flex: 1,
  },
  section: {
    marginVertical: 4,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: appColors.white,
    borderRadius: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.gray,
  },
  flatListContent: {
    paddingTop: 4,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: appColors.white,
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: appColors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  roundButton: {
    marginRight: 10,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'column',
  },
  taskTitle: {
    fontSize: 16,
    color: appColors.black,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: appColors.gray,
  },
  taskDate: {
    fontSize: 14,
    color: appColors.red,
    marginTop: 4,
  },
  swipeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  swipeActionButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: appColors.black,
    fontSize: 14,
    marginTop: 4,
  },
});

export default HomeScreen;

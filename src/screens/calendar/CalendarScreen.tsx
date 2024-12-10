import auth, {firebase} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {addDays, endOfWeek, format, isSameDay, startOfWeek} from 'date-fns';
import {Flag, Repeat, Star1, StarSlash, Trash} from 'iconsax-react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {RowComponent} from '../../components';
import {appColors} from '../../constants';
import useCustomStatusBar from '../../hooks/useCustomStatusBar';
import {TaskModel} from '../../models/taskModel';
import {
  fetchTasks,
  handleDelete,
  handleHighlight,
  handleToggleCompleteTask,
  handleUpdateRepeatTask,
} from '../../utils/taskUtil';
import {CategoryModel} from '../../models/categoryModel';
import TaskTimetableView from '../../components/TaskTimetableView'; // Import the new component

const CalendarScreen = ({navigation}: any) => {
  useCustomStatusBar('light-content', appColors.primary);
  const user = auth().currentUser;
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selected, setSelected] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});

  // Fetch tasks
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = fetchTasks(user.uid, setTasks);
      return () => unsubscribe();
    }
  }, [user?.uid]);

  // Fetch categories
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
  }, [user]);

  // Mark dates with tasks
  useEffect(() => {
    const newMarkedDates: {[key: string]: any} = {};

    tasks.forEach(task => {
      if (task.isCompleted) return; // Skip completed tasks
      const dateString = task.startDate?.split('T')[0];
      if (dateString) {
        if (!newMarkedDates[dateString]) {
          newMarkedDates[dateString] = {
            marked: true,
            dotColor: appColors.primary,
          };
        }
      }
    });

    setMarkedDates(newMarkedDates);
  }, [tasks]);

  // Task press handler
  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('TaskDetailsScreen', {
      id: task.id,
    });
  };

  // Filter tasks based on selected date for month view
  const filterTasksByDate = () => {
    return tasks.filter(
      task =>
        task.startDate &&
        isSameDay(new Date(task.startDate), new Date(selected)),
    );
  };

  // Render tasks for month view
  const renderMonthTasks = () => {
    const filteredTasks = filterTasksByDate();

    return (
      <ScrollView
        contentContainerStyle={styles.taskScrollView}
        showsVerticalScrollIndicator={false}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const category = categories.find(
              category => category.name === task.category,
            );
            const categoryColor = category?.color || appColors.gray2;

            return (
              <Pressable key={task.id} onPress={() => handleTaskPress(task)}>
                <View
                  style={[
                    styles.taskItem,
                    {
                      borderLeftColor: task.isCompleted
                        ? appColors.gray
                        : categoryColor,
                      backgroundColor: task.isCompleted
                        ? appColors.gray2
                        : appColors.white,
                    },
                  ]}>
                  <Text style={styles.taskTitle}>
                    {task.title || task.description}
                  </Text>
                  <Text style={styles.taskDate}>
                    {format(new Date(task.startDate || ''), 'HH:mm')}
                  </Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.emptyTaskText}>
            Không có công việc nào cho ngày này
          </Text>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: appColors.lightPurple}}>
      {/* View mode toggle */}
      <RowComponent styles={styles.viewModeToggle}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'week' && styles.activeViewMode,
          ]}
          onPress={() => setViewMode('week')}>
          <Text
            style={
              viewMode === 'week'
                ? {color: appColors.black, fontWeight: '600'}
                : {color: appColors.white, fontWeight: '600'}
            }>
            Công việc trong tuần
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'month' && styles.activeViewMode,
          ]}
          onPress={() => setViewMode('month')}>
          <Text
            style={
              viewMode === 'month'
                ? {color: appColors.black, fontWeight: '600'}
                : {color: appColors.white, fontWeight: '600'}
            }>
            Công việc trong tháng
          </Text>
        </TouchableOpacity>
      </RowComponent>

      {/* Conditional rendering of calendar or week view */}
      {viewMode === 'month' ? (
        <Calendar
          onDayPress={(day: {dateString: string}) => {
            setSelected(day.dateString);
          }}
          markedDates={{
            [new Date().toISOString().split('T')[0]]: {
              customStyles: {
                text: {
                  color: appColors.primary,
                  fontWeight: 'bold',
                },
              },
            },
            ...markedDates,
            [selected]: {
              ...markedDates[selected],
              selected: true,
              disableTouchEvent: true,
              selectedDotColor: appColors.primary,
              selectedColor: appColors.primary,
            },
          }}
        />
      ) : (
        <TaskTimetableView
          tasks={tasks}
          categories={categories}
          onTaskPress={handleTaskPress}
        />
      )}

      {/* Task list for month view */}
      {viewMode === 'month' && (
        <View style={{flex: 1, paddingTop: 10}}>{renderMonthTasks()}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Most styles remain the same as in the previous version
  viewModeToggle: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: appColors.primary,
  },
  viewModeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: appColors.primary,
    borderColor: appColors.white,
    borderWidth: 1,
  },
  activeViewMode: {
    backgroundColor: appColors.lightPurple,
  },
  taskScrollView: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    borderLeftWidth: 2,
  },
  taskTitle: {
    fontSize: 16,
    color: appColors.black,
    flex: 1,
  },
  taskDate: {
    fontSize: 14,
    color: appColors.gray,
  },
  emptyTaskText: {
    fontSize: 16,
    textAlign: 'center',
    color: appColors.gray,
    marginTop: 20,
  },
});

export default CalendarScreen;

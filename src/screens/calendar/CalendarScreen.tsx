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
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {Swipeable} from 'react-native-gesture-handler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {RowComponent, SpaceComponent} from '../../components';
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
import moment from 'moment';
import TaskTimetableView from '../../components/TaskTimetableView';

// Set Vietnamese locale for the calendar
LocaleConfig.locales['vi'] = {
  monthNames: [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ],
  monthNamesShort: [
    'Th1',
    'Th2',
    'Th3',
    'Th4',
    'Th5',
    'Th6',
    'Th7',
    'Th8',
    'Th9',
    'Th10',
    'Th11',
    'Th12',
  ],
  dayNames: [
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
    'Chủ nhật',
  ],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay',
};
LocaleConfig.defaultLocale = 'vi';

const CalendarScreen = ({navigation}: any) => {
  useCustomStatusBar('light-content', appColors.primary);
  const user = auth().currentUser;
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  console.log('tasks', tasks.length);
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = fetchTasks(user.uid, setTasks);
      return () => unsubscribe();
    }
  }, [user?.uid]);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), {weekStartsOn: 1}),
  );
  const [selectedWeekDay, setSelectedWeekDay] = useState<Date | null>(null);
  const [showAllWeekTasks, setShowAllWeekTasks] = useState(true);
  const [categories, setCategories] = useState<CategoryModel[]>([]);

  const [selected, setSelected] = useState(
    new Date().toISOString().split('T')[0],
  );

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

  const [filteredTasks, setFilteredTasks] = useState<TaskModel[]>([]);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});

  useEffect(() => {
    const newMarkedDates: {[key: string]: any} = {};

    tasks.forEach(task => {
      if (task.isCompleted) return;
      if (task.startDate) {
        const localDate = new Date(task.startDate); // UTC
        const vietnamDate = new Date(localDate.getTime() + 7 * 60 * 60 * 1000); // +7h
        const dateString = vietnamDate.toISOString().split('T')[0];

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

  useEffect(() => {
    let filtered: TaskModel[] = [];

    if (viewMode === 'month') {
      filtered = tasks.filter(
        task =>
          task.startDate &&
          isSameDay(new Date(task.startDate), new Date(selected)),
      );
    } else {
      const weekStart = startOfWeek(currentWeek, {weekStartsOn: 1});
      const weekEnd = endOfWeek(currentWeek, {weekStartsOn: 1}); // Đảm bảo tuần kết thúc đúng

      filtered = tasks
        .filter(task => {
          if (!task.startDate) return false;
          const taskDate = new Date(task.startDate);

          // Logic xử lý task trong tuần
          if (showAllWeekTasks) {
            return taskDate >= weekStart && taskDate <= weekEnd;
          }

          // Kiểm tra khi đã chọn một ngày cụ thể
          return (
            taskDate >= weekStart &&
            taskDate <= weekEnd &&
            (selectedWeekDay === null || isSameDay(taskDate, selectedWeekDay))
          );
        })
        .sort((a, b) => {
          const getDateTime = (task: TaskModel) => {
            if (task.startDate) return new Date(task.startDate).getTime();
            return Infinity;
          };
          const getHour = (task: TaskModel) => {
            if (task.startTime) return new Date(task.startTime).getHours();
            return Infinity;
          };
          return getDateTime(a) - getDateTime(b) || getHour(a) - getHour(b);
        });
    }

    setFilteredTasks(filtered);
  }, [
    tasks,
    selected,
    viewMode,
    currentWeek,
    selectedWeekDay,
    showAllWeekTasks,
  ]);

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };
  //hien thi ngay thang nam thanh Thu 2, 3, 4, 5, 6, 7, CN
  const formtDaysofWeek = (date: Date) => {
    const vietnameseDays: {
      [key in
        | 'Monday'
        | 'Tuesday'
        | 'Wednesday'
        | 'Thursday'
        | 'Friday'
        | 'Saturday'
        | 'Sunday']: string;
    } = {
      Monday: 'Thứ hai',
      Tuesday: 'Thứ ba',
      Wednesday: 'Thứ tư',
      Thursday: 'Thứ năm',
      Friday: 'Thứ sáu',
      Saturday: 'Thứ bảy',
      Sunday: 'Chủ nhật',
    };
    return vietnameseDays[format(date, 'eeee') as keyof typeof vietnameseDays];
  };

  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('TaskDetailsScreen', {
      id: task.id,
    });
  };

  const renderTask = (item: TaskModel) => {
    if (!item) return null;

    const renderRightActions = (item: TaskModel) => (
      <View style={styles.swipeActions}>
        <Pressable
          style={styles.swipeActionButton}
          onPress={() => handleDelete(item.id)}>
          <Trash size={24} color={appColors.red} variant="Bold" />
          <Text style={styles.actionText}>Xóa</Text>
        </Pressable>

        {item.repeat !== 'no' && (
          <Pressable
            style={styles.swipeActionButton}
            onPress={() => handleUpdateRepeatTask(item.id, item.title)}>
            <Repeat size={24} color={appColors.blue} />
            <Text style={styles.actionText}>Bỏ lặp lại</Text>
          </Pressable>
        )}
      </View>
    );

    const category = categories.find(
      category => category.name === item.category,
    );
    const categoryColor = category?.color || appColors.gray2;
    const categoryIcon = category?.icon;

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        key={item.id}>
        <Pressable onPress={() => handleTaskPress(item)}>
          <View
            style={[
              styles.taskItem,
              {
                borderLeftColor: item.isCompleted
                  ? appColors.gray
                  : categoryColor,
              },
              {
                backgroundColor: item.isCompleted
                  ? appColors.gray2
                  : appColors.white,
              },
            ]}>
            <Pressable
              style={styles.roundButton}
              onPress={() => handleToggleCompleteTask(item.id)}>
              {item.isCompleted ? (
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={appColors.gray}
                />
              ) : (
                <MaterialIcons
                  name="radio-button-unchecked"
                  size={24}
                  color={appColors.primary}
                />
              )}
            </Pressable>
            <RowComponent>
              <View style={styles.taskContent}>
                <Text
                  style={[
                    styles.taskTitle,
                    item.isCompleted && styles.completedTaskTitle,
                  ]}>
                  {item.title ? item.title : item.description}
                </Text>

                <Text style={styles.taskDate}>
                    {item.dueDate
                    ? formtDaysofWeek(new Date(item.startDate || ''))
                    : 'No due date'}
                    ,{' '}
                  {item.dueDate
                    ? fomatDate(new Date(item.startDate || ''))
                    : 'No due date'}{' '}
                  -{' '}
                  {item.startTime
                    ? formatTime(item.startTime)
                    : 'No start time'}
                  <SpaceComponent width={10} />
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    {categoryIcon && (
                      <MaterialIcons
                        name={categoryIcon}
                        size={16}
                        color={categoryColor}
                      />
                    )}
                    <SpaceComponent width={10} />
                    {item.repeat !== 'no' && (
                      <Repeat size="16" color={appColors.red} />
                    )}
                  </View>
                </Text>
              </View>
              <View>
                {item.priority === 'low' && (
                  <Flag size="24" color={appColors.green} variant="Bold" />
                )}
                {item.priority === 'medium' && (
                  <Flag size="24" color={appColors.yellow} variant="Bold" />
                )}
                {item.priority === 'high' && (
                  <Flag size="24" color={appColors.red} variant="Bold" />
                )}
              </View>
              <SpaceComponent width={10} />
              <Pressable
                style={{
                  paddingRight: 40,
                }}
                onPress={() => handleHighlight(item.id)}>
                {item.isImportant ? (
                  <Star1 size={24} color="#FF8A65" />
                ) : (
                  <StarSlash size={24} color="#FF8A65" />
                )}
              </Pressable>
            </RowComponent>
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  const groupTasksByHour = (tasks: TaskModel[], viewMode: 'month' | 'week') => {
    const morningTasks = tasks.filter(task => {
      if (!task.startTime || task.isCompleted) return false;
      const taskHour = new Date(task.startTime).getHours();
      return taskHour >= 5 && taskHour < 12;
    });

    const afternoonTasks = tasks.filter(task => {
      if (!task.startTime || task.isCompleted) return false;
      const taskHour = new Date(task.startTime).getHours();
      return taskHour >= 12 && taskHour < 18;
    });

    const eveningTasks = tasks.filter(task => {
      if (!task.startTime || task.isCompleted) return false;
      const taskHour = new Date(task.startTime).getHours();
      return taskHour >= 18 && taskHour < 24;
    });

    const groupedTasks = [
      {label: 'Buổi sáng', tasks: morningTasks},
      {label: 'Buổi chiều', tasks: afternoonTasks},
      {label: 'Buổi tối', tasks: eveningTasks},
    ];

    return groupedTasks.filter(group => group.tasks.length > 0);
  };
  // Memoize the grouped tasks
  const groupedTasks = useMemo(
    () => groupTasksByHour(filteredTasks, viewMode),
    [filteredTasks, viewMode],
  );

  // Modify the task rendering to support hour grouping
  const renderMonthTasks = (group: {label?: string; tasks: TaskModel[]}) => {
    return (
      <View
        key={group.label || 'ungrouped'}
        style={viewMode === 'month' ? styles.hourGroupContainer : null}>
        {viewMode === 'month' && group.label && (
          <Text style={styles.hourGroupLabel}>{group.label}</Text>
        )}

        {group.tasks.map(renderTask)}
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: appColors.lightPurple}}>
      <RowComponent styles={styles.viewModeToggle}>
        <Text
          style={{
            color: appColors.white,
            fontSize: 24,
            fontWeight: '600',
            marginLeft: 10,
          }}>
          Công việc theo
        </Text>
        <RowComponent>
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
              Tuần
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
              Tháng
            </Text>
          </TouchableOpacity>
        </RowComponent>
      </RowComponent>

      {/* Conditional rendering of calendar or week view */}
      {viewMode === 'month' ? (
        <Calendar
          onDayPress={(day: {dateString: string}) => {
            setSelected(day.dateString);
          }}
          markedDates={{
            [moment().format('YYYY-MM-DD')]: {
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

      {/* Task list */}
      {viewMode === 'month' && (
        <View style={{flex: 1, paddingTop: 10}}>
          {groupedTasks.map(renderMonthTasks)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Existing styles
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
    marginHorizontal: 8,
    borderLeftWidth: 2,
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
    color: appColors.gray,
  },
  taskDate: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 4,
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
  // New styles for view mode toggle and week view
  viewModeToggle: {
    justifyContent: 'space-between',
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
  // viewModeText: {
  //   color: appColors.black,
  //   fontWeight: '600',
  // },
  weekViewContainer: {
    backgroundColor: appColors.white,
    paddingVertical: 10,
  },
  weekNavigation: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  weekDayItem: {
    alignItems: 'center',
  },
  weekDayLabel: {
    fontSize: 12,
    color: appColors.black,
  },
  weekDayNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedWeekDay: {
    backgroundColor: appColors.lightPurple,
    borderRadius: 10,
  },
  todayLabel: {
    color: appColors.primary,
    fontWeight: 'bold',
  },
  todayNumber: {
    color: appColors.primary,
    fontWeight: 'bold',
  },
  selectedDayNumber: {
    color: appColors.white,
    backgroundColor: appColors.primary,
    borderRadius: 15,
    overflow: 'hidden',
    padding: 2,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: appColors.primary,
    marginTop: 4,
  },
  hourGroupContainer: {
    marginBottom: 15,
    padding: 10,
  },
  hourGroupLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.green,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  taskGroupScrollView: {
    paddingBottom: 20,
  },
  emptyTaskText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default CalendarScreen;

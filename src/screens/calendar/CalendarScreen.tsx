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
import { CategoryModel } from '../../models/categoryModel';


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
    'Chủ nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
  ],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay',
};
LocaleConfig.defaultLocale = 'vi';

const hourRanges = [
  {start: 5, end: 6, label: '5h - 6h'},
  {start: 6, end: 7, label: '6h - 7h'},
  {start: 7, end: 8, label: '7h - 8h'},
  {start: 8, end: 9, label: '8h - 9h'},
  {start: 9, end: 10, label: '9h - 10h'},
  {start: 10, end: 11, label: '10h - 11h'},
  {start: 11, end: 12, label: '11h - 12h'},
  {start: 12, end: 13, label: '12h - 13h'},
  {start: 13, end: 14, label: '13h - 14h'},
  {start: 14, end: 15, label: '14h - 15h'},
  {start: 15, end: 16, label: '15h - 16h'},
  {start: 16, end: 17, label: '16h - 17h'},
  {start: 17, end: 18, label: '17h - 18h'},
  {start: 18, end: 19, label: '18h - 19h'},
  {start: 19, end: 20, label: '19h - 20h'},
  {start: 20, end: 21, label: '20h - 21h'},
  {start: 21, end: 22, label: '21h - 22h'},
  {start: 22, end: 23, label: '22h - 23h'},
  {start: 23, end: 24, label: '23h - 0h'},
];

const CalendarScreen = ({navigation}: any) => {
  useCustomStatusBar('light-content', appColors.primary);
  const user = auth().currentUser;
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = fetchTasks(user.uid, setTasks);

      // Cleanup on unmount
      return () => unsubscribe();
    }
  }, [user?.uid]);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentWeek, setCurrentWeek] = useState(new Date());
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

  useEffect(() => {
    let filtered: TaskModel[] = [];

    if (viewMode === 'month') {
      filtered = tasks.filter(
        task =>
          task.startDate &&
          isSameDay(new Date(task.startDate), new Date(selected)),
      );
    } else {
      const weekStart = startOfWeek(currentWeek);
      const weekEnd = endOfWeek(currentWeek);

      filtered = tasks
        .filter(task => {
          if (!task.startDate) return false;
          const taskDate = new Date(task.startDate);

          if (showAllWeekTasks) {
            return taskDate >= weekStart && taskDate <= weekEnd;
          }

          return (
            taskDate >= weekStart &&
            taskDate <= weekEnd &&
            selectedWeekDay &&
            isSameDay(taskDate, selectedWeekDay)
          );
        })
        .sort((a, b) => {
          const getDateTime = (task: TaskModel) => {
            if (task.startDate) return new Date(task.startDate).getTime();

            return Infinity; // Push tasks without date/time to the end
          };
          const getHour = (task: TaskModel) => {
            if (task.startTime) return new Date(task.startTime).getHours();

            return Infinity; // Push tasks without date/time to the end
          };
          return getDateTime(a) - getDateTime(b) || getHour(a) - getHour(b); // This is already in ascending order (tăng dần)

          return getDateTime(a) - getDateTime(b); // This is already in ascending order (tăng dần)
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

    // Find the category with matching name and get its color
    const category = categories.find(
      category => category.name === item.category,
    );
    const categoryColor = category?.color || appColors.gray2;
    const categoryIcon =
      category?.icon ||
      (item.category === 'Du lịch'
        ? 'airplanemode-active'
        : item.category === 'Sinh nhật'
        ? 'cake'
        : '');

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
                    ? fomatDate(new Date(item.startDate || ''))
                    : 'No due date'}{' '}
                  -{' '}
                  {item.startTime
                    ? formatTime(item.startTime)
                    : 'No start time'}
                  <SpaceComponent width={10} />
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
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
    // If it's week view, return tasks without grouping
    if (viewMode === 'week') {
      return [{tasks: tasks}];
    }

    return hourRanges
      .map(range => {
        const tasksInRange = tasks.filter(task => {
          if (!task.startTime) return false;
          const taskHour = new Date(task.startTime).getHours();
          return taskHour >= range.start && taskHour < range.end;
        });

        return {
          ...range,
          tasks: tasksInRange,
        };
      })
      .filter(group => group.tasks.length > 0);
  };
  // Memoize the grouped tasks
  const groupedTasks = useMemo(
    () => groupTasksByHour(filteredTasks, viewMode),
    [filteredTasks, viewMode],
  );

  // Modify the task rendering to support hour grouping
  const renderHourGroup = (group: {label?: string; tasks: TaskModel[]}) => {
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
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentWeek, {weekStartsOn: 1});
    const weekDates = Array.from({length: 7}, (_, i) => addDays(weekStart, i));
    const today = new Date();

    const vietnameseDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
      <View style={styles.weekViewContainer}>
        <RowComponent styles={styles.weekNavigation}>
          <TouchableOpacity
            onPress={() => setCurrentWeek(prevWeek => addDays(prevWeek, -7))}>
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={appColors.black}
            />
          </TouchableOpacity>
          <Text style={styles.weekTitle}>
            {format(weekStart, 'dd/MM/yyyy')} -{' '}
            {format(addDays(weekStart, 6), 'dd/MM/yyyy')}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentWeek(prevWeek => addDays(prevWeek, 7))}>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={appColors.black}
            />
          </TouchableOpacity>
        </RowComponent>

        <View style={styles.weekDaysContainer}>
          {weekDates.map(date => {
            const dayIndex = date.getDay() || 7;
            const vietnameseDayShort = vietnameseDays[dayIndex - 1];
            const isToday = isSameDay(date, today);
            const isSelected = selectedWeekDay
              ? isSameDay(date, selectedWeekDay)
              : false;

            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  styles.weekDayItem,
                  selectedWeekDay &&
                    isSameDay(date, selectedWeekDay) &&
                    styles.selectedWeekDay,
                ]}
                onPress={() => {
                  if (
                    showAllWeekTasks ||
                    (selectedWeekDay && !isSameDay(date, selectedWeekDay))
                  ) {
                    setSelectedWeekDay(date);
                    setSelected(format(date, 'yyyy-MM-dd'));
                    setShowAllWeekTasks(false);
                  } else {
                    setShowAllWeekTasks(true);
                    setSelectedWeekDay(null);
                  }
                }}>
                <Text
                  style={[styles.weekDayLabel, isToday && styles.todayLabel]}>
                  {vietnameseDayShort}
                </Text>
                <Text
                  style={[
                    styles.weekDayNumber,
                    isToday && styles.todayNumber,
                    isSelected && styles.selectedDayNumber,
                  ]}>
                  {format(date, 'dd')}
                </Text>
                {markedDates[format(date, 'yyyy-MM-dd')] && (
                  <View style={styles.taskDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: appColors.lightPurple}}>
      {/* View mode toggle */}
      <RowComponent styles={styles.viewModeToggle}>
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
        renderWeekView()
      )}

      {/* Task list */}
      <View style={{flex: 1, paddingTop: 10}}>
        {filteredTasks.length > 0 ? (
          <ScrollView
            contentContainerStyle={styles.taskGroupScrollView}
            showsVerticalScrollIndicator={false}>
            {groupedTasks.length > 0 ? (
              groupedTasks.map(renderHourGroup)
            ) : (
              <Text style={styles.emptyTaskText}>
                Không có nhiệm vụ nào cho{' '}
                {viewMode === 'month' ? 'ngày này' : 'tuần này'}.
              </Text>
            )}
          </ScrollView>
        ) : (
          <Text style={styles.emptyTaskText}>
            Không có nhiệm vụ nào cho{' '}
            {viewMode === 'month' ? 'ngày này' : 'tuần này'}.
          </Text>
        )}
      </View>
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
    textDecorationLine: 'line-through',
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
    justifyContent: 'flex-end',
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

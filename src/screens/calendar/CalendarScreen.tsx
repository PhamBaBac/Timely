import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {isSameDay, addDays, format, startOfWeek, endOfWeek} from 'date-fns';
import {appColors} from '../../constants';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {TaskModel} from '../../models/taskModel';
import {useNavigation} from '@react-navigation/native';
import {DateTime} from '../../utils/DateTime';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Swipeable} from 'react-native-gesture-handler';
import {RowComponent, SpaceComponent} from '../../components';
import {
  fetchCompletedTasks,
  fetchDeletedTasks,
  fetchImportantTasks,
  handleDeleteTask,
  handleToggleComplete,
  handleToggleImportant,
  handleUpdateRepeat,
} from '../../utils/taskUtil';
import {useDispatch} from 'react-redux';
import useCustomStatusBar from '../../hooks/useCustomStatusBar';
import {Flag, Repeat, Star1, StarSlash, Trash} from 'iconsax-react-native';

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

const CalendarScreen = ({navigation}: any) => {
  useCustomStatusBar('light-content', appColors.primary);
  const dispatch = useDispatch();

  // New state for view mode
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedWeekDay, setSelectedWeekDay] = useState<Date | null>(null);

  const [selected, setSelected] = useState(
    new Date().toISOString().split('T')[0],
  );
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const categories = useSelector(
    (state: RootState) => state.categories.categories,
  );
  const [filteredTasks, setFilteredTasks] = useState<TaskModel[]>([]);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});

  // Lọc task theo ngày được chọn hoặc tuần hiện tại
  useEffect(() => {
    let filtered: TaskModel[] = [];

    if (viewMode === 'month') {
      filtered = tasks.filter(
        task =>
          task.startDate &&
          isSameDay(new Date(task.startDate), new Date(selected)),
      );
    } else {
      // Week view filtering
      const weekStart = startOfWeek(currentWeek);
      const weekEnd = endOfWeek(currentWeek);

      filtered = tasks.filter(task => {
        if (!task.startDate) return false;
        const taskDate = new Date(task.startDate);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, selected, viewMode, currentWeek]);

  // Cập nhật markedDates khi tasks thay đổi
  useEffect(() => {
    const newMarkedDates: {[key: string]: any} = {};

    tasks.forEach(task => {
      const dateString = task.startDate?.split('T')[0]; // Lấy ngày từ startDate
      if (dateString) {
        // Kiểm tra nếu ngày chưa được đánh dấu
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
    fetchDeletedTasks(dispatch);
    fetchCompletedTasks(dispatch);
    fetchImportantTasks(dispatch);
  }, [dispatch]);

  // Week navigation handlers
  const goToPreviousWeek = () => {
    setCurrentWeek(prevWeek => addDays(prevWeek, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prevWeek => addDays(prevWeek, 7));
  };

  useEffect(() => {
    let filtered: TaskModel[] = [];

    if (viewMode === 'month') {
      filtered = tasks.filter(
        task =>
          task.startDate &&
          isSameDay(new Date(task.startDate), new Date(selected)),
      );
    } else {
      // Week view filtering
      const weekStart = startOfWeek(currentWeek);
      const weekEnd = endOfWeek(currentWeek);

      filtered = tasks.filter(task => {
        if (!task.startDate) return false;
        const taskDate = new Date(task.startDate);

        // If no specific day is selected, show all tasks for the week
        if (!selectedWeekDay) {
          return taskDate >= weekStart && taskDate <= weekEnd;
        }

        // If a specific day is selected, filter tasks for that day
        return (
          taskDate >= weekStart &&
          taskDate <= weekEnd &&
          isSameDay(taskDate, selectedWeekDay)
        );
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, selected, viewMode, currentWeek, selectedWeekDay]);

  // Week view renderer
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentWeek, {weekStartsOn: 1});
    const weekDates = Array.from({length: 7}, (_, i) => addDays(weekStart, i));
    const today = new Date();

    const vietnameseDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
      <View style={styles.weekViewContainer}>
        <RowComponent styles={styles.weekNavigation}>
          <TouchableOpacity onPress={goToPreviousWeek}>
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
          <TouchableOpacity onPress={goToNextWeek}>
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
              //chỗ này hiển thị ngày tháng

              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  styles.weekDayItem,
                  isSelected && styles.selectedWeekDay,
                ]}
                onPress={() => {
                  setSelectedWeekDay(date);
                  setSelected(format(date, 'yyyy-MM-dd'));
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
  const handleDelete = (taskId: string, repeatCount: number) => {
    handleDeleteTask(taskId, dispatch, repeatCount);
  };
  const handleToggleCompleteTask = (taskId: string) => {
    handleToggleComplete(taskId, tasks, dispatch);
  };

  const handleHighlight = async (taskId: string) => {
    handleToggleImportant(taskId, tasks, dispatch);
  };
  const handleUpdateRepeatTask = (taskId: string) => {
    handleUpdateRepeat(taskId);
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  const renderTask = (item: TaskModel) => {
    if (!item) return null;

    const renderRightActions = (item: TaskModel) => (
      <View style={styles.swipeActions}>
        <Pressable
          style={styles.swipeActionButton}
          onPress={() => handleDelete(item.id, item.repeatCount)}>
          <Trash size={24} color={appColors.red} variant="Bold" />
          <Text style={styles.actionText}>Xóa</Text>
        </Pressable>

        {item.repeat !== 'no' && (
          <Pressable
            style={styles.swipeActionButton}
            onPress={() => handleUpdateRepeatTask(item.id)}>
            <Repeat size={24} color={appColors.blue} />
            <Text style={styles.actionText}>Bỏ lặp lại</Text>
          </Pressable>
        )}
      </View>
    );
    const categoryIcon =
      categories.find(category => category.name === item.category)?.icon ||
      (item.category === 'Du lịch'
        ? 'airplanemode-active'
        : item.category === 'Sinh nhật'
        ? 'cake'
        : '');

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        key={item.id}>
        <Pressable onPress={() => {}}>
          <View
            style={[
              styles.taskItem,
              {
                borderLeftColor: item.isCompleted
                  ? appColors.gray
                  : appColors.primary,
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
                      color={appColors.gray2}
                    />
                  )}
                  <SpaceComponent width={10} />
                  {item.repeat !== 'no' && (
                    <Repeat size="16" color={appColors.gray2} />
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
          <Text style={viewMode === 'month' ? {color: appColors.black, fontWeight: '600'} : {color: appColors.white, fontWeight: '600'}}>
            Tháng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'week' && styles.activeViewMode,
          ]}
          onPress={() => setViewMode('week')}>
          <Text style={viewMode === 'week' ? {color: appColors.black, fontWeight: '600'} : {color: appColors.white, fontWeight: '600'}}>
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
          <FlatList
            data={filteredTasks.sort((a, b) => {
              const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
              const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
              return dateB - dateA;
            })}
            renderItem={({item}) => renderTask(item)}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text style={{fontSize: 16, textAlign: 'center', color: '#666'}}>
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
});

export default CalendarScreen;

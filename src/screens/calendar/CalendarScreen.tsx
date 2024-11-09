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
import {isSameDay, addDays, addWeeks, addMonths, format} from 'date-fns';
import {appColors} from '../../constants';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {TaskModel} from '../../models/taskModel';
import {useNavigation} from '@react-navigation/native';
import {DateTime} from '../../utils/DateTime';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Swipeable} from 'react-native-gesture-handler';
import {RowComponent} from '../../components';
import {
  fetchCompletedTasks,
  fetchDeletedTasks,
  fetchImportantTasks,
  handleDeleteTask,
  handleToggleComplete,
  handleToggleImportant,
} from '../../utils/taskUtil';
import {useDispatch} from 'react-redux';
import useCustomStatusBar from '../../hooks/useCustomStatusBar';

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
  useCustomStatusBar('dark-content', appColors.white);
  const dispatch = useDispatch();
  const deletedTaskIds = useSelector(
    (state: RootState) => state.tasks.deletedTaskIds,
  );
  const [selected, setSelected] = useState(
    new Date().toISOString().split('T')[0],
  );
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const [filteredTasks, setFilteredTasks] = useState<TaskModel[]>([]);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});

  // Lọc task theo ngày được chọn
  useEffect(() => {
    const filtered = tasks.filter(
      task =>
        task.startDate &&
        isSameDay(new Date(task.startDate), new Date(selected)),
    );
    setFilteredTasks(filtered);
  }, [tasks, selected]);

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

  const handleDelete = (taskId: string, repeatCount: number) => {
    handleDeleteTask(taskId, dispatch, repeatCount);
  };
  const handleToggleCompleteTask = (taskId: string) => {
    handleToggleComplete(taskId, tasks, dispatch);
  };

  const handleHighlight = async (taskId: string) => {
    handleToggleImportant(taskId, tasks, dispatch);
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM');
  };
  const renderTask = (item: TaskModel) => {
    if (!item) return null;

    const renderRightActions = (item: TaskModel) => (
      <View style={styles.swipeActions}>
        <Pressable
          style={styles.swipeActionButton}
          onPress={() => handleDelete(item.id, item.repeatCount)}>
          <MaterialIcons name="delete" size={24} color={appColors.red} />
          <Text style={styles.actionText}>Xóa</Text>
        </Pressable>

        {item.repeat !== 'no' && (
          <Pressable style={styles.swipeActionButton}>
            <MaterialIcons name="repeat" size={24} color={appColors.blue} />
            <Text style={styles.actionText}>Bỏ lặp lại</Text>
          </Pressable>
        )}
      </View>
    );

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
                </Text>
              </View>
              <Pressable
                style={{
                  paddingRight: 40,
                }}
                onPress={() => handleHighlight(item.id)}>
                <MaterialIcons
                  name="star"
                  size={24}
                  color={item.isImportant ? appColors.yellow : appColors.gray2}
                />
              </Pressable>
            </RowComponent>
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: appColors.lightPurple}}>
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
            Không có nhiệm vụ nào cho ngày này.
          </Text>
        )}
      </View>
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
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

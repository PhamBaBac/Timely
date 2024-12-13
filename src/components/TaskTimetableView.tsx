import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {addDays, startOfWeek, endOfWeek, format, isSameDay} from 'date-fns';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Flag, Repeat, Star1, StarSlash, Trash} from 'iconsax-react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {appColors} from '../constants';
import {TaskModel} from '../models/taskModel';
import {CategoryModel} from '../models/categoryModel';
import {
  handleDelete,
  handleHighlight,
  handleToggleCompleteTask,
  handleUpdateRepeatTask,
} from '../utils/taskUtil';
import {RowComponent, SpaceComponent} from '../components';

const {width, height} = Dimensions.get('window');
const PERIODS = ['Sáng', 'Chiều', 'Tối'];

interface TaskTimetableViewProps {
  tasks: TaskModel[];
  categories: CategoryModel[];
  onTaskPress: (task: TaskModel) => void;
}

const formatDaysOfWeek = (date: Date) => {
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

const formatTime = (date: Date | string) => {
  return format(new Date(date), 'HH:mm');
};

const TaskTimetableView: React.FC<TaskTimetableViewProps> = ({
  tasks,
  categories,
  onTaskPress,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeekDay, setSelectedWeekDay] = useState<Date | null>(null);
  const [showAllWeekTasks, setShowAllWeekTasks] = useState(true);

  // Generate week days based on the current date
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, {weekStartsOn: 1});
    const end = endOfWeek(currentDate, {weekStartsOn: 1});
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, i);
      days.push({
        day: formatDaysOfWeek(day),
        date: format(day, 'dd/MM'),
        fullDate: day,
        isSaturday: format(day, 'eeee') === 'Saturday',
        isSunday: format(day, 'eeee') === 'Sunday',
      });
    }
    return days;
  }, [currentDate]);

  // Filter tasks for the selected period and day
  const filterTasksForPeriodAndDay = (period: string, dayDate: Date) => {
    return tasks.filter(task => {
      if (!task.startDate) return false; // Chỉ giữ lại điều kiện kiểm tra startDate

      const taskDate = new Date(task.startDate);
      const taskHour = new Date(task.startTime || '').getHours();

      const isCorrectDate = isSameDay(taskDate, dayDate);

      const isCorrectPeriod =
        (period === 'Sáng' && taskHour >= 5 && taskHour < 12) ||
        (period === 'Chiều' && taskHour >= 12 && taskHour < 18) ||
        (period === 'Tối' && taskHour >= 18 && taskHour < 24);

      const weekStart = startOfWeek(currentDate, {weekStartsOn: 1});
      const weekEnd = endOfWeek(currentDate, {weekStartsOn: 1});
      const isInCurrentWeek = taskDate >= weekStart && taskDate <= weekEnd;

      if (showAllWeekTasks) {
        return isInCurrentWeek && isCorrectDate && isCorrectPeriod;
      }

      return (
        isInCurrentWeek &&
        isCorrectDate &&
        isCorrectPeriod &&
        (selectedWeekDay === null || isSameDay(taskDate, selectedWeekDay))
      );
    });
  };

  const renderTaskDetails = (task: TaskModel) => {
    const category = categories.find(
      category => category.name === task.category,
    );
    const categoryColor = category?.color || appColors.gray2;
    const categoryIcon = category?.icon;

    const renderRightActions = () => (
      <View style={styles.swipeActions}>
        <Pressable
          style={styles.swipeActionButton}
          onPress={() => handleDelete(task.id)}>
          <Trash size={24} color={appColors.red} variant="Bold" />
          <Text style={styles.actionText}>Xóa</Text>
        </Pressable>

        {task.repeat !== 'no' && (
          <Pressable
            style={styles.swipeActionButton}
            onPress={() => handleUpdateRepeatTask(task.id, task.title)}>
            <Repeat size={24} color={appColors.blue} />
            <Text style={styles.actionText}>Bỏ lặp lại</Text>
          </Pressable>
        )}
      </View>
    );

    return (
      <Swipeable renderRightActions={() => renderRightActions()} key={task.id}>
        <TouchableOpacity
          onPress={() => onTaskPress(task)}
          style={[
            styles.taskContainer,
            {
              backgroundColor: task.isCompleted
                ? appColors.gray2
                : appColors.white,
              borderColor: task.isCompleted ? appColors.gray : categoryColor,
              borderWidth: 2,
            },
          ]}>
          <Pressable
            style={styles.roundButton}
            onPress={() => handleToggleCompleteTask(task.id)}>
            {task.isCompleted ? (
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
          <View style={styles.taskContentWrapper}>
            <RowComponent styles={styles.taskTitleRow}>
              <View style={styles.taskContent}>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={[
                    styles.taskTitle,
                    task.isCompleted && styles.completedTaskTitle,
                  ]}>
                  {task.title || task.description}
                </Text>
              </View>
              <View style={styles.taskIconsContainer}>
                {task.priority === 'low' && (
                  <Flag size="20" color={appColors.green} variant="Bold" />
                )}
                {task.priority === 'medium' && (
                  <Flag size="20" color={appColors.yellow} variant="Bold" />
                )}
                {task.priority === 'high' && (
                  <Flag size="20" color={appColors.red} variant="Bold" />
                )}
                <Pressable
                  style={styles.starButton}
                  onPress={() => handleHighlight(task.id)}>
                  {task.isImportant ? (
                    <Star1 size={20} color="#FF8A65" />
                  ) : (
                    <StarSlash size={20} color="#FF8A65" />
                  )}
                </Pressable>
              </View>
            </RowComponent>

            <View style={styles.taskDetailsRow}>
              <Text style={styles.taskDate}>
                {formatDaysOfWeek(new Date(task.startDate || ''))}
                {', '}
                {format(new Date(task.startDate || ''), 'dd/MM/yyyy')}
                {' - '}
                {task.startTime ? formatTime(task.startTime) : 'No start time'}
              </Text>
              <View style={styles.taskMetadata}>
                {categoryIcon && (
                  <MaterialIcons
                    name={categoryIcon}
                    size={16}
                    color={categoryColor}
                  />
                )}
                {task.repeat !== 'no' && (
                  <Repeat size="16" color={appColors.red} />
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const prepareTableData = () => {
    const header = ['Buổi', ...weekDays.map(day => `${day.day}\n${day.date}`)];

    const body = PERIODS.map(period => {
      return [
        period,
        ...weekDays.map(day => {
          const periodTasks = filterTasksForPeriodAndDay(period, day.fullDate);
          return {
            tasks: periodTasks,
            color: periodTasks.length > 0 ? appColors.lightPurple : '#ffffff',
          };
        }),
      ];
    });

    return {header, body};
  };

  const renderRow = ({item}: {item: any[]}) => (
    <View style={styles.row}>
      {item.map((cell, index) => (
        <View
          key={`cell-${index}`}
          style={[
            styles.cell,
            index === 0 ? [styles.periodCell, styles.periodNameCell] : {},
            {
              backgroundColor:
                typeof cell === 'string'
                  ? appColors.primary
                  : cell.color || '#ffffff',
              width: index === 0 ? 80 : 350,
            },
          ]}>
          {index === 0 ? (
            <Text style={styles.periodNameText}>{cell}</Text>
          ) : typeof cell === 'object' &&
            cell.tasks &&
            cell.tasks.length > 0 ? (
            cell.tasks.map(renderTaskDetails)
          ) : (
            <Text style={styles.emptyCellText}>Không có công việc</Text>
          )}
        </View>
      ))}
    </View>
  );

  const {header, body} = prepareTableData();

  return (
    <View style={styles.container}>
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          onPress={() => setCurrentDate(addDays(currentDate, -7))}
          style={styles.navButton}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={appColors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.dateRangeText}>
          {format(weekDays[0].fullDate, 'dd/MM')} -{' '}
          {format(weekDays[6].fullDate, 'dd/MM')}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrentDate(addDays(currentDate, 7))}
          style={styles.navButton}>
          <MaterialIcons
            name="arrow-forward"
            size={24}
            color={appColors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal>
        <View>
          <View style={[styles.row, styles.headerRow]}>
            {header.map((cell, index) => (
              <View
                key={`header-${index}`}
                style={[
                  styles.cell,
                  styles.headerCell,
                  index === 0 ? styles.periodCell : {},
                  {width: index === 0 ? 80 : 350},
                ]}>
                <Text style={styles.headerText}>{cell}</Text>
              </View>
            ))}
          </View>
          <FlatList
            data={body}
            renderItem={renderRow}
            keyExtractor={(item, index) => `row-${index}`}
            showsVerticalScrollIndicator={true}
            style={styles.flatlistContainer}
            contentContainerStyle={styles.flatlistContent}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.lightPurple,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: appColors.white,
  },
  navButton: {
    padding: 10,
  },
  taskContentWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  taskTitleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetailsRow: {
    flexDirection: 'column',
    marginTop: 8,
  },
  taskContent: {
    flex: 1,
    marginRight: 10,
  },
  taskDate: {
    fontSize: 12,
    color: appColors.gray,
    marginBottom: 4,
  },
  taskMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateRangeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: appColors.white,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: appColors.lightPurple,
  },
  activeFilterButton: {
    backgroundColor: appColors.primary,
  },
  filterText: {
    color: appColors.gray,
  },
  activeFilterText: {
    color: appColors.white,
    fontWeight: '600',
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
  flatlistContainer: {
    maxHeight: height * 0.7,
  },
  flatlistContent: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  headerRow: {
    backgroundColor: appColors.primary,
  },
  headerCell: {
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray2,
  },
  cell: {
    minHeight: 150, // Increased height
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appColors.gray2,
    width: width * 0.4, // Use 40% of screen width
  },
  periodCell: {
    backgroundColor: appColors.primary,
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyCellText: {
    color: appColors.gray,
    fontStyle: 'italic',
  },
  taskContainer: {
    width: 320, // Set default width to 320
    padding: 15, // Increased padding
    marginVertical: 8, // Slightly increased vertical margin
    borderRadius: 10, // More rounded corners
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000', // Added subtle shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  taskTitle: {
    fontSize: 18, // Increased font size
    fontWeight: 'bold',
    flexWrap: 'wrap', // Allow wrapping for longer titles
    maxWidth: width * 0.25, // Limit width to prevent overflow
  },
  taskMetadataText: {
    marginRight: 10,
    fontSize: 14, // Slightly larger font
    color: appColors.gray,
  },

  completedTaskTitle: {
    color: appColors.gray,
    textDecorationLine: 'line-through',
  },

  starButton: {
    padding: 5,
  },
  periodNameCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodNameText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    transform: [{rotate: '-90deg'}],
    width: 80, // Adjust width for "Buổi" column
    height: 100, // Add a fixed height
    textAlignVertical: 'center', // Helps center the text vertically when rotated
  },

  roundButton: {
    marginRight: 10,
  },
});

export default TaskTimetableView;

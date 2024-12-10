import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {addDays, startOfWeek, endOfWeek, format} from 'date-fns';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Flag, Repeat, Star1, StarSlash} from 'iconsax-react-native';
import {appColors} from '../constants';
import {TaskModel} from '../models/taskModel';
import {CategoryModel} from '../models/categoryModel';
import {
  handleDelete,
  handleHighlight,
  handleToggleCompleteTask,
  handleUpdateRepeatTask,
} from '../utils/taskUtil';

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

const TaskTimetableView: React.FC<TaskTimetableViewProps> = ({
  tasks,
  categories,
  onTaskPress,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const filterTasksForPeriodAndDay = (period: string, dayDate: Date) => {
    return tasks.filter(task => {
      if (!task.startDate || task.isCompleted) return false;
      const taskDate = new Date(task.startDate);
      const taskHour = new Date(task.startTime || '').getHours();

      const isCorrectDate =
        taskDate.getFullYear() === dayDate.getFullYear() &&
        taskDate.getMonth() === dayDate.getMonth() &&
        taskDate.getDate() === dayDate.getDate();

      const isCorrectPeriod =
        (period === 'Sáng' && taskHour >= 5 && taskHour < 12) ||
        (period === 'Chiều' && taskHour >= 12 && taskHour < 18) ||
        (period === 'Tối' && taskHour >= 18 && taskHour < 24);

      return isCorrectDate && isCorrectPeriod;
    });
  };

  const renderTaskDetails = (task: TaskModel) => {
    // Find the category for this task
    const category = categories.find(
      category => category.name === task.category,
    );
    // Use the category color or default to gray
    const categoryColor = category?.color || appColors.gray2;

    return (
      <TouchableOpacity
        onPress={() => onTaskPress(task)}
        style={[
          styles.taskContainer,
          {
            // Change background based on completion status
            backgroundColor: task.isCompleted
              ? appColors.gray2
              : appColors.white,
            // Border color based on completion and category
            borderColor: task.isCompleted ? appColors.gray : categoryColor,
            borderWidth: 2,
          },
        ]}>
        <View style={styles.taskContent}>
          {/* Task Title */}
          <Text
            style={[
              styles.taskTitle,
              task.isCompleted && styles.completedTaskTitle,
            ]}>
            {task.title || task.description}
          </Text>

          {/* Task Metadata */}
          <View style={styles.taskMetadata}>
            {/* Start Time */}
            <Text style={styles.taskMetadataText}>
              {task.startTime
                ? format(new Date(task.startTime), 'HH:mm')
                : 'No time'}
            </Text>

            {/* Priority Flag */}
            {task.priority && (
              <Flag
                size="16"
                color={
                  task.priority === 'low'
                    ? appColors.green
                    : task.priority === 'medium'
                    ? appColors.yellow
                    : appColors.red
                }
                variant="Bold"
              />
            )}

            {/* Repeat Icon */}
            {task.repeat !== 'no' && <Repeat size="16" color={appColors.red} />}
          </View>
        </View>

        {/* Star/Important Button */}
        <TouchableOpacity
          onPress={() => handleHighlight(task.id)}
          style={styles.starButton}>
          {task.isImportant ? (
            <Star1 size={24} color="#FF8A65" />
          ) : (
            <StarSlash size={24} color="#FF8A65" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
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
              width: index === 0 ? 80 : 350, // Adjust width for "Buổi" column
            },
          ]}>
          {index === 0 ? (
            <Text style={styles.periodNameText}>{cell}</Text>
          ) : typeof cell === 'object' &&
            cell.tasks &&
            cell.tasks.length > 0 ? (
            cell.tasks.map((task: TaskModel) => renderTaskDetails(task))
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
                  {width: index === 0 ? 80 : 350}, // Adjust width for "Buổi" column
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
  dateRangeText: {
    fontSize: 16,
    fontWeight: 'bold',
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
    minHeight: 100,
    padding: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appColors.gray2,
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
    fontSize: 16, // Increased font size
    fontWeight: 'bold',
  },
  taskMetadataText: {
    marginRight: 10,
    fontSize: 14, // Slightly larger font
    color: appColors.gray,
  },
  taskContent: {
    flex: 1,
    marginRight: 10,
  },
  completedTaskTitle: {
    color: appColors.gray,
    textDecorationLine: 'line-through',
  },
  taskMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
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
});

export default TaskTimetableView;

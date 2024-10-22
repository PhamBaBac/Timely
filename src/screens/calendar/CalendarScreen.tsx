import {View, Text, FlatList} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import firestore from '@react-native-firebase/firestore';
import {
  isSameDay,
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  isValid,
} from 'date-fns';
import {appColors} from '../../constants';
import auth from '@react-native-firebase/auth';
import {TaskModel} from '../../models/taskModel';
import {useNavigation} from '@react-navigation/native';
import {DateTime} from '../../utils/DateTime';
import TaskItemComponent from '../../components/TaskItemComponent';

// Vietnamese locale configuration remains unchanged

const CalendarScreen = ({navigation}: {navigation: any}) => {
  const user = auth().currentUser;
  const [selected, setSelected] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskModel[]>([]);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const tasksList = snapshot.docs.map(
          doc =>
            ({
              id: doc.id,
              ...doc.data(),
            } as TaskModel),
        );
        setTasks(tasksList);
      });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const filtered = tasks.filter(task => {
      if (!task.startDate) return false;
      const repeatedDates = calculateRepeatedDates(
        task.startDate,
        task.repeat as 'day' | 'week' | 'month',
        365,
      );
      return repeatedDates.some(date =>
        isSameDay(parseISO(date), parseISO(selected)),
      );
    });
    setFilteredTasks(filtered);
  }, [selected, tasks]);

  useEffect(() => {
    const newMarkedDates: {[key: string]: any} = {};
    tasks.forEach(task => {
      if (!task.startDate) return;
      const repeatedDates = calculateRepeatedDates(
        task.startDate,
        task.repeat as 'day' | 'week' | 'month',
        7,
      );
      repeatedDates.forEach(date => {
        const dateString = date.split('T')[0];
        if (!newMarkedDates[dateString]) {
          newMarkedDates[dateString] = {
            marked: true,
            dotColor: appColors.primary,
          };
        }
      });
    });
    setMarkedDates(newMarkedDates);
  }, [tasks]);

  const calculateRepeatedDates = (
    startDate: string,
    repeat: 'day' | 'week' | 'month',
    count: number,
  ) => {
    const dates: string[] = [];
    let currentDate = new Date(startDate);

    if (!isValid(currentDate)) {
      console.error('Invalid start date:', startDate);
      return dates;
    }

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

  const handleToggleComplete = async (id: string) => {
    const taskRef = firestore().collection('tasks').doc(id);
    const task = tasks.find(t => t.id === id);
    if (task) {
      await taskRef.update({isCompleted: !task.isCompleted});
    }
  };

  const handleHighlight = async (id: string) => {
    const taskRef = firestore().collection('tasks').doc(id);
    const task = tasks.find(t => t.id === id);
    if (task) {
      await taskRef.update({isImportant: !task.isImportant});
    }
  };

  const handleDelete = async (id: string) => {
    await firestore().collection('tasks').doc(id).delete();
  };

  const handleUpdateRepeat = async (id: string) => {
    const taskRef = firestore().collection('tasks').doc(id);
    await taskRef.update({repeat: 'no'});
  };

  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('TaskDetailScreen' as never, {task} as never);
  };

  const formatTime = (time: any) => {
    if (!time) return '';
    if (typeof time === 'string') {
      // If time is already a string, assume it's in the correct format
      return time;
    }
    if (time instanceof Date) {
      // If time is a Date object, format it
      return time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    }
    // If time is a Firestore Timestamp, convert to Date then format
    if (time && typeof time.toDate === 'function') {
      return time
        .toDate()
        .toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    }
    return '';
  };

  return (
    <View style={{flex: 1}}>
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
            data={filteredTasks}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TaskItemComponent
                item={{
                  ...item,
                  startTime: formatTime(item.startTime),
                }}
                onToggleComplete={handleToggleComplete}
                onHighlight={handleHighlight}
                onDelete={handleDelete}
                onUpdateRepeat={handleUpdateRepeat}
                onPress={handleTaskPress}
              />
            )}
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

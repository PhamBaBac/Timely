import {View, Text, FlatList} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import firestore from '@react-native-firebase/firestore';
import {isSameDay, parseISO, addDays, addWeeks, addMonths} from 'date-fns';
import {appColors} from '../../constants';
import auth from '@react-native-firebase/auth';

interface Task {
  id: string;
  description: string;
  repeat: 'day' | 'week' | 'month';
  startDate: string;
}

const CalendarScreen = () => {
  const user = auth().currentUser;
  const [selected, setSelected] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  console.log('tasks', tasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const tasksList = snapshot.docs.map(doc => doc.data() as Task);
        setTasks(tasksList);
      });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = tasks.filter(task => {
      const repeatedDates = calculateRepeatedDates(
        task.startDate,
        task.repeat,
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
      const repeatedDates = calculateRepeatedDates(
        task.startDate,
        task.repeat,
        365,
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


  return (
    <View>
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
      <FlatList
        data={filteredTasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View>
            <Text style={{color: 'black'}}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default CalendarScreen;


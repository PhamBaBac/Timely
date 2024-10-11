import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import firestore from '@react-native-firebase/firestore';
import {
  isSameDay,
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  format,
} from 'date-fns';
import {appColors} from '../../constants';
import auth from '@react-native-firebase/auth';
import {TaskModel} from '../../models/taskModel';
import {useNavigation} from '@react-navigation/native';

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
        const tasksList = snapshot.docs.map(doc => doc.data() as TaskModel);
        setTasks(tasksList);
      });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const filtered = tasks.filter(task => {
      const repeatedDates = calculateRepeatedDates(
        task.startDate || '',
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
      const repeatedDates = calculateRepeatedDates(
        task.startDate || '',
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

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy');
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
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            paddingHorizontal: 16,
            marginBottom: 10,
          }}>
          Nhiệm vụ ngày {formatDate(selected)}:
        </Text>
        {filteredTasks.length > 0 ? (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: 15,
                  marginVertical: 8,
                  marginHorizontal: 16,
                  borderRadius: 10,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() =>
                  navigation.navigate('TaskDetailScreen', {task: item})
                }>
                <Text
                  style={{
                    color: '#333',
                    fontSize: 18,
                    fontWeight: '600',
                  }}>
                  {item.description}
                </Text>
              </TouchableOpacity>
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

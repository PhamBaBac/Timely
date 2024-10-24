import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Alert,
  Platform,
  Text,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {addDays, isBefore} from 'date-fns';
import {ScheduleHeader} from '../../components/ScheduleHeader';
import {WeekNavigator} from '../../components/WeekNavigator';
import {ScheduleDayItem} from '../../components/ScheduleDayItem';
import {ScheduleItem} from '../../components/ScheduleItemProps ';
import {ScheduleFormModal} from '../../components/ScheduleFormModalProps';
import {ScheduleModel} from '../../models/ScheduleModel';
import {WeekDayModel} from '../../models/WeekDayModel';
import LoadingModal from '../../modal/LoadingModal';
import {DateTime} from '../../utils/DateTime';

const Teamwork = () => {
  const user = auth().currentUser;
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [lastDisplayedDate, setLastDisplayedDate] = useState<string>('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [newSchedule, setNewSchedule] = useState<ScheduleModel>({
    id: '',
    startDate: new Date(),
    endDate: new Date(),
    course: '',
    period: '',
    group: '',
    room: '',
    instructor: '',
    isExam: false,
    day: new Date(),
  });
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  useEffect(() => {
    fetchSchedules();
    setCurrentWeekToToday();
  }, []);

  const getMonday = (d: Date) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const setCurrentWeekToToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
    setSelectedDay(null);
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection('schedules')
        .where('uid', '==', user?.uid)
        .get();
      const schedulesList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate ? data.startDate.toDate() : new Date(),
          endDate: data.endDate ? data.endDate.toDate() : new Date(),
        } as ScheduleModel;
      });

      schedulesList.sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime(),
      );
      setSchedules(schedulesList);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const generateWeekDays = (startDate: Date): WeekDayModel[] => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const dateOffset = new Date(startDate);
      dateOffset.setDate(startDate.getDate() + i);

      weekDays.push({
        day: DateTime.GetWeekday(dateOffset.getTime()),
        date: dateOffset.toISOString().split('T')[0],
        fullDate: dateOffset,
        isSaturday: dateOffset.getDay() === 6,
        isSunday: dateOffset.getDay() === 0,
      });
    }
    return weekDays;
  };

  const weekDays = generateWeekDays(currentWeekStart);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(
      newWeekStart.getDate() + (direction === 'next' ? 7 : -7),
    );
    setCurrentWeekStart(newWeekStart);
    setSelectedDay(null);
  };

  const calculateRepeatedDates = (startDate: Date, endDate: Date) => {
    const dates = [];
    let currentDate = new Date(startDate);
    while (
      isBefore(currentDate, endDate) ||
      currentDate.getTime() === endDate.getTime()
    ) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 7);
    }
    return dates;
  };

  const filteredScheduleItems = schedules
    .flatMap(item => {
      const repeatedDates = calculateRepeatedDates(
        item.startDate,
        item.endDate,
      );
      return repeatedDates.map(date => ({
        ...item,
        startDate: date,
        endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      }));
    })
    .filter(item => {
      const itemDate = item.startDate.toISOString().split('T')[0];
      return selectedDay
        ? itemDate === selectedDay
        : weekDays.some(day => itemDate === day.date);
    });

  const handleDeleteSchedule = (scheduleId: string) => {
    Alert.alert('Xóa lịch học', 'Bạn có chắc chắn muốn xóa lịch học này?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xóa',
        onPress: () => confirmDeleteSchedule(scheduleId),
        style: 'destructive',
      },
    ]);
  };

  const confirmDeleteSchedule = async (scheduleId: string) => {
    setLoading(true);
    try {
      await firestore().collection('schedules').doc(scheduleId).delete();
      console.log('Schedule deleted:', scheduleId);
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      Alert.alert('Lỗi', 'Không thể xóa lịch học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    setLoading(true);
    try {
      const scheduleRef = newSchedule.id
        ? firestore().collection('schedules').doc(newSchedule.id)
        : firestore().collection('schedules').doc();
      const schedule = {
        ...newSchedule,
        uid: user?.uid,
      };
      await scheduleRef.set(schedule);
      console.log('Schedule saved/updated:', schedule);
      fetchSchedules();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Lỗi', 'Không thể lưu lịch học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const EmptySchedule = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Không có lịch học</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScheduleHeader
        onTodayPress={setCurrentWeekToToday}
        onAddPress={() => {
          setNewSchedule({
            id: '',
            startDate: new Date(),
            endDate: new Date(),
            course: '',
            period: '',
            group: '',
            room: '',
            instructor: '',
            isExam: false,
            day: new Date(),
          });
          setModalVisible(true);
        }}
      />

      <WeekNavigator
        weekDays={weekDays}
        onPrevWeek={() => navigateWeek('prev')}
        onNextWeek={() => navigateWeek('next')}
      />

      <View style={styles.weekDaysWrapper}>
        <FlatList
          data={weekDays}
          renderItem={({item}) => (
            <View style={styles.dayItemContainer}>
              <ScheduleDayItem
                item={item}
                selectedDay={selectedDay}
                onPress={date =>
                  setSelectedDay(date === selectedDay ? null : date)
                }
              />
            </View>
          )}
          keyExtractor={item => item.date}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekDaysContainer}
        />
      </View>

      <View style={styles.scheduleListContainer}>
        <FlatList
          data={filteredScheduleItems}
          renderItem={({item}) => (
            <View style={styles.scheduleItemContainer}>
              <ScheduleItem
                item={item}
                onPress={(schedule: React.SetStateAction<ScheduleModel>) => {
                  setNewSchedule(schedule);
                  setModalVisible(true);
                }}
              />
            </View>
          )}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          style={styles.scheduleContainer}
          ListEmptyComponent={EmptySchedule}
          contentContainerStyle={styles.scheduleContentContainer}
        />
      </View>

      <ScheduleFormModal
        visible={modalVisible}
        schedule={newSchedule}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveSchedule}
        onDelete={handleDeleteSchedule}
        onScheduleChange={setNewSchedule}
        showStartDatePicker={showStartDatePicker}
        showEndDatePicker={showEndDatePicker}
        onStartDatePickerChange={(event, date) => {
          setShowStartDatePicker(Platform.OS === 'ios');
          if (date) setNewSchedule({...newSchedule, startDate: date});
        }}
        onEndDatePickerChange={(event, date) => {
          setShowEndDatePicker(Platform.OS === 'ios');
          if (date) setNewSchedule({...newSchedule, endDate: date});
        }}
        setShowStartDatePicker={setShowStartDatePicker}
        setShowEndDatePicker={setShowEndDatePicker}
      />

      <LoadingModal visible={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  weekDaysWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weekDaysContainer: {
    paddingHorizontal: 10,
  },
  dayItemContainer: {
    marginHorizontal: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  scheduleListContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleContainer: {
    flex: 1,
  },
  scheduleContentContainer: {
    padding: 10,
  },
  scheduleItemContainer: {
    marginVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Teamwork;

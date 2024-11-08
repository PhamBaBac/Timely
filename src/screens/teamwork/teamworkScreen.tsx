import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
import ScheduleByPeriod from '../../components/ScheduleByPeriod';

// Định nghĩa period order ở ngoài component để tránh tạo lại mỗi lần render
const PERIOD_ORDER: {[key: string]: number} = {
  '1-3': 1,
  '4-6': 2,
  '7-9': 3,
  '10-12': 4,
  '13-15': 5,
};

const DEFAULT_SCHEDULE: ScheduleModel = {
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
};

const Teamwork = () => {
  const user = auth().currentUser;
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [newSchedule, setNewSchedule] =
    useState<ScheduleModel>(DEFAULT_SCHEDULE);
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getMonday(new Date()),
  );

  // Chuyển getMonday thành pure function ở ngoài component
  function getMonday(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }
  // Thêm hàm này sau hàm getMonday
  const getTodayString = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  const fetchSchedules = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const snapshot = await firestore()
        .collection('schedules')
        .where('uid', '==', user.uid)
        .get();

      const schedulesList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        startDate: doc.data().startDate?.toDate() || new Date(),
        endDate: doc.data().endDate?.toDate() || new Date(),
      })) as ScheduleModel[];

      setSchedules(schedulesList);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const setCurrentWeekToToday = useCallback(() => {
    const today = new Date();
    setCurrentWeekStart(getMonday(today));
    setSelectedDay(getTodayString()); // Set selected day to today
  }, [getTodayString]);

  const weekDays = useMemo(() => {
    const days: WeekDayModel[] = [];
    for (let i = 0; i < 7; i++) {
      const dateOffset = new Date(currentWeekStart);
      dateOffset.setDate(currentWeekStart.getDate() + i);

      days.push({
        day: DateTime.GetWeekday(dateOffset.getTime()),
        date: dateOffset.toISOString().split('T')[0],
        fullDate: dateOffset,
        isSaturday: dateOffset.getDay() === 6,
        isSunday: dateOffset.getDay() === 0,
      });
    }
    return days;
  }, [currentWeekStart]);

  const navigateWeek = useCallback(
    (direction: 'prev' | 'next') => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(
        newWeekStart.getDate() + (direction === 'next' ? 7 : -7),
      );
      setCurrentWeekStart(newWeekStart);
      setSelectedDay(null);
    },
    [currentWeekStart],
  );

  const calculateRepeatedDates = useCallback(
    (startDate: Date, endDate: Date) => {
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
    },
    [],
  );

  const filteredScheduleItems = useMemo(() => {
    return schedules
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
          : weekDays.some(day => day.date === itemDate);
      })
      .sort((a, b) => {
        if (a.startDate.getTime() !== b.startDate.getTime()) {
          return a.startDate.getTime() - b.startDate.getTime();
        }
        const periodA = PERIOD_ORDER[a.period] || 999;
        const periodB = PERIOD_ORDER[b.period] || 999;
        return periodA - periodB;
      });
  }, [schedules, selectedDay, weekDays, calculateRepeatedDates]);

  const handleDeleteSchedule = useCallback(
    (scheduleId: string) => {
      Alert.alert('Xóa lịch học', 'Bạn có chắc chắn muốn xóa lịch học này?', [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: async () => {
            setLoading(true);
            try {
              await firestore()
                .collection('schedules')
                .doc(scheduleId)
                .delete();
              await fetchSchedules();
            } catch (error) {
              console.error('Error deleting schedule:', error);
              Alert.alert(
                'Lỗi',
                'Không thể xóa lịch học. Vui lòng thử lại sau.',
              );
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]);
    },
    [fetchSchedules],
  );

  const handleSaveSchedule = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const scheduleRef = newSchedule.id
        ? firestore().collection('schedules').doc(newSchedule.id)
        : firestore().collection('schedules').doc();

      await scheduleRef.set({
        ...newSchedule,
        uid: user.uid,
      });

      await fetchSchedules();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Lỗi', 'Không thể lưu lịch học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [newSchedule, user?.uid, fetchSchedules]);

  const handleAddNewSchedule = useCallback(() => {
    setNewSchedule(DEFAULT_SCHEDULE);
    setModalVisible(true);
  }, []);

  const handleSchedulePress = useCallback((schedule: ScheduleModel) => {
    setNewSchedule(schedule);
    setModalVisible(true);
  }, []);

  const handleDatePickerChange = useCallback(
    (type: 'start' | 'end', event: any, date?: Date) => {
      if (Platform.OS === 'ios') {
        type === 'start'
          ? setShowStartDatePicker(false)
          : setShowEndDatePicker(false);
      }
      if (date) {
        setNewSchedule(prev => ({
          ...prev,
          [type === 'start' ? 'startDate' : 'endDate']: date,
        }));
      }
    },
    [],
  );

  const EmptySchedule = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có lịch học</Text>
      </View>
    ),
    [],
  );

  // Thêm useEffect này
  useEffect(() => {
    setSelectedDay(getTodayString());
  }, [getTodayString]);

  return (
    <SafeAreaView style={styles.container}>
      <ScheduleHeader
        onTodayPress={setCurrentWeekToToday}
        onAddPress={handleAddNewSchedule}
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
        <View style={styles.scheduleListContainer}>
          <ScheduleByPeriod
            schedules={filteredScheduleItems}
            onSchedulePress={handleSchedulePress}
          />
        </View>
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
        onStartDatePickerChange={(event, date) =>
          handleDatePickerChange('start', event, date)
        }
        onEndDatePickerChange={(event, date) =>
          handleDatePickerChange('end', event, date)
        }
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

    // backgroundColor: '#fff',
    // margin: 10,
    // borderRadius: 15,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  scheduleContainer: {
    flex: 1,
  },
  scheduleContentContainer: {
    padding: 10,
    height: 300,
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

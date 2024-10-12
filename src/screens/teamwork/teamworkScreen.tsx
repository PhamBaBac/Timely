import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  TextInput,
  Switch,
  Platform,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {DateTime} from '../../utils/DateTime';
import LoadingModal from '../../modal/LoadingModal';
import {addDays, addWeeks, addMonths} from 'date-fns';

interface ScheduleModel {
  id: string;
  startDate: Date;
  endDate: Date;
  course: string;
  period: string;
  group: string;
  room: string;
  instructor: string;
  isExam: boolean;
  repeatWeekly: boolean;
  repeatCount: number;
}

const calculateRepeatedDates = (
  startDate: Date,
  repeat: 'day' | 'week' | 'month',
  count: number,
) => {
  const dates = [];
  let currentDate = new Date(startDate);
  for (let i = 0; i < count; i++) {
    dates.push(new Date(currentDate));
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

const Teamwork = () => {
  const user = auth().currentUser;
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
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
    repeatWeekly: false,
    repeatCount: 1,
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
    } finally {
      setLoading(false);
    }
  };

  const setCurrentWeekToToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
    setSelectedDay(null);
  };

  const generateWeekDays = (startDate: Date) => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const dateOffset = new Date(startDate);
      dateOffset.setDate(startDate.getDate() + i);

      const dayName = DateTime.GetWeekday(dateOffset.getTime());
      const dayDate = dateOffset.toISOString().split('T')[0];

      weekDays.push({
        day: dayName,
        date: dayDate,
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

  const filteredScheduleItems = schedules
    .flatMap(item => {
      if (item.repeatWeekly) {
        const repeatedDates = calculateRepeatedDates(
          item.startDate,
          'week',
          item.repeatCount,
        );
        return repeatedDates.map(date => ({
          ...item,
          startDate: date,
          endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000), // End date is next day
        }));
      } else {
        return [item];
      }
    })
    .filter(item => {
      const itemDate = item.startDate.toISOString().split('T')[0];
      return selectedDay
        ? itemDate === selectedDay
        : weekDays.some(day => itemDate === day.date);
    });

  const renderDayItem = ({
    item,
  }: {
    item: {
      day: string;
      date: string;
      fullDate: Date;
      isSaturday: boolean;
      isSunday: boolean;
    };
  }) => (
    <TouchableOpacity
      style={[
        styles.dayButton,
        item.date === selectedDay && styles.selectedDayButton,
        (item.isSaturday || item.isSunday) && styles.weekendDayButton,
      ]}
      onPress={() =>
        setSelectedDay(item.date === selectedDay ? null : item.date)
      }>
      <View style={styles.dayContent}>
        <Text
          style={[
            styles.dayText,
            item.date === selectedDay && styles.selectedDayText,
            (item.isSaturday || item.isSunday) && styles.weekendDayText,
          ]}>
          {item.day}
        </Text>
        <Text
          style={[
            styles.dateText,
            item.date === selectedDay && styles.selectedDateText,
            (item.isSaturday || item.isSunday) && styles.weekendDateText,
          ]}>
          {item.fullDate.getDate()}
        </Text>
        {item.date === selectedDay && <View style={styles.selectedDot} />}
      </View>
    </TouchableOpacity>
  );

  const renderScheduleItem = ({item}: {item: ScheduleModel}) => (
    <TouchableOpacity
      onPress={() => handleEditSchedule(item)}
      style={styles.scheduleItem}>
      <Text style={styles.scheduleDate}>
        {`${DateTime.GetWeekday(item.startDate.getTime())}`}
      </Text>
      <View
        style={[
          styles.scheduleItemContent,
          item.isExam && styles.examScheduleItemContent,
        ]}>
        <Text style={styles.scheduleItemTitle}>{item.course}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tiết :</Text>
          <Text style={styles.detailValue}>{item.period}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Nhóm :</Text>
          <Text style={styles.detailValue}>{item.group}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phòng :</Text>
          <Text style={styles.detailValue}>{item.room}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Giảng viên :</Text>
          <Text style={styles.detailValue}>{item.instructor}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleEditSchedule = (schedule: ScheduleModel) => {
    setNewSchedule(schedule);
    setModalVisible(true);
  };

  const handleAddSchedule = () => {
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
      repeatWeekly: false,
      repeatCount: 1,
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
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
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || newSchedule.startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setNewSchedule({...newSchedule, startDate: currentDate});
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || newSchedule.endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setNewSchedule({...newSchedule, endDate: currentDate});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch học/ Lịch</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={setCurrentWeekToToday}
            style={styles.todayButton}>
            <MaterialIcons name="today" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddSchedule}
            style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.weekNavigation}>
        <TouchableOpacity
          onPress={() => navigateWeek('prev')}
          style={styles.navButton}>
          <MaterialIcons name="chevron-left" size={24} color="#8A2BE2" />
        </TouchableOpacity>
        <Text style={styles.weekLabel}>
          {`${weekDays[0].fullDate.toLocaleDateString()} - ${weekDays[6].fullDate.toLocaleDateString()}`}
        </Text>
        <TouchableOpacity
          onPress={() => navigateWeek('next')}
          style={styles.navButton}>
          <MaterialIcons name="chevron-right" size={24} color="#8A2BE2" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysWrapper}>
        <FlatList
          data={weekDays}
          renderItem={renderDayItem}
          keyExtractor={item => item.date}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekDaysContainer}
        />
      </View>

      <FlatList
        data={filteredScheduleItems}
        renderItem={renderScheduleItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        style={styles.scheduleContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {newSchedule.id ? 'Chỉnh sửa lịch học' : 'Thêm lịch học mới'}
            </Text>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowStartDatePicker(true)}>
              <Text>
                Ngày bắt đầu:{' '}
                {newSchedule.startDate.toLocaleDateString('en-GB')}
              </Text>
            </TouchableOpacity>

            {showStartDatePicker && (
              <DateTimePicker
                value={newSchedule.startDate}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
              />
            )}

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowEndDatePicker(true)}>
              <Text>
                Ngày kết thúc: {newSchedule.endDate.toLocaleDateString('en-GB')}
              </Text>
            </TouchableOpacity>

            {showEndDatePicker && (
              <DateTimePicker
                value={newSchedule.endDate}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Môn học"
              value={newSchedule.course}
              onChangeText={text =>
                setNewSchedule({...newSchedule, course: text})
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Tiết"
              value={newSchedule.period}
              onChangeText={text =>
                setNewSchedule({...newSchedule, period: text})
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Nhóm"
              value={newSchedule.group}
              onChangeText={text =>
                setNewSchedule({...newSchedule, group: text})
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Phòng"
              value={newSchedule.room}
              onChangeText={text =>
                setNewSchedule({...newSchedule, room: text})
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Giảng viên"
              value={newSchedule.instructor}
              onChangeText={text =>
                setNewSchedule({...newSchedule, instructor: text})
              }
            />

            <View style={styles.switchContainer}>
              <Text>Thi :</Text>
              <Switch
                value={newSchedule.isExam}
                onValueChange={value =>
                  setNewSchedule({...newSchedule, isExam: value})
                }
              />
            </View>

            <View style={styles.switchContainer}>
              <Text>Lặp lại hàng tuần:</Text>
              <Switch
                value={newSchedule.repeatWeekly}
                onValueChange={value =>
                  setNewSchedule({...newSchedule, repeatWeekly: value})
                }
              />
            </View>

            {newSchedule.repeatWeekly && (
              <TextInput
                style={styles.input}
                placeholder="Số lần lặp lại"
                value={newSchedule.repeatCount.toString()}
                onChangeText={text =>
                  setNewSchedule({
                    ...newSchedule,
                    repeatCount: parseInt(text) || 1,
                  })
                }
                keyboardType="numeric"
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleCloseModal}>
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveSchedule}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayButton: {
    marginRight: 16,
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#8A2BE2',
    padding: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#8A2BE2',
    fontSize: 24,
    fontWeight: 'bold',
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  navButton: {
    padding: 8,
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A2BE2',
  },
  weekDaysWrapper: {
    height: 80,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  weekDaysContainer: {
    paddingVertical: 4,
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 5,
    marginHorizontal: 2,
    borderRadius: 6,
    height: 70,
  },
  selectedDayButton: {
    backgroundColor: '#8A2BE2',
  },
  weekendDayButton: {
    // You can add specific styles for weekend days if needed
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  selectedDayText: {
    color: 'white',
  },
  selectedDateText: {
    color: 'white',
  },
  weekendDayText: {
    color: 'red',
  },
  weekendDateText: {
    color: 'red',
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    marginTop: 2,
  },
  scheduleContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scheduleItem: {
    marginBottom: 16,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginBottom: 8,
  },
  scheduleItemContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8A2BE2',
  },
  examScheduleItemContent: {
    borderLeftColor: 'red',
  },
  scheduleItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    flex: 1,
    color: '#8A2BE2',
  },
  detailValue: {
    flex: 2,
    fontWeight: '500',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    backgroundColor: '#2196F3',
    flex: 1,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Teamwork;

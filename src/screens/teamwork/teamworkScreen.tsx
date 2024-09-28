import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appInfo} from '../../constants';
import {DateTime} from '../../utils/DateTime';
import LoadingModal from './../../modal/LoadingModal';

interface ScheduleModel {
  id: string;
  day: Date;
  course: string;
  period: string;
  group: string;
  room: string;
  instructor: string;
  isExam: boolean;
}

const Teamwork = () => {
  const user = auth().currentUser;
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newSchedule, setNewSchedule] = useState<ScheduleModel>({
    id: '',
    day: new Date(),
    course: '',
    period: '',
    group: '',
    room: '',
    instructor: '',
    isExam: false,
  });
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

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
          day: data.day ? data.day.toDate() : new Date(), // Convert Firestore Timestamp to Date
        } as ScheduleModel;
      });
      setSchedules(schedulesList);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeekDays = () => {
    const current = new Date();
    const weekDays = [];

    const monday = new Date(current);
    monday.setDate(
      current.getDate() - current.getDay() + (current.getDay() === 0 ? -6 : 1),
    );

    for (let i = 0; i < 7; i++) {
      const dateOffset = new Date(monday);
      dateOffset.setDate(monday.getDate() + i);

      const dayName = DateTime.GetWeekday(dateOffset.getTime());
      const dayDate = DateTime.GetDayOfWeek(dateOffset.getTime());

      weekDays.push({
        day: dayName,
        date: dayDate,
        isSaturday: dateOffset.getDay() === 6,
        isSunday: dateOffset.getDay() === 0,
      });
    }

    return weekDays;
  };

  const weekDays = generateWeekDays();

  const filteredScheduleItems = selectedDay
    ? schedules.filter(item => {
        if (item.day instanceof Date) {
          const itemDate = DateTime.GetDayOfWeek(item.day.getTime());
          return itemDate === selectedDay;
        }
        return false;
      })
    : schedules;

  const renderDayItem = ({
    item,
  }: {
    item: {day: string; date: string; isSaturday: boolean; isSunday: boolean};
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
          {item.date}
        </Text>
        {item.date === selectedDay && <View style={styles.selectedDot} />}
      </View>
    </TouchableOpacity>
  );

  const renderScheduleItem = ({item}: {item: ScheduleModel}) => (
    <View style={styles.scheduleItem}>
      <Text style={styles.scheduleDate}>
        {item.day instanceof Date
          ? item.day.toLocaleDateString('en-GB')
          : 'Invalid Date'}
      </Text>
      <View
        style={[
          styles.scheduleItemContent,
          item.isExam && styles.examScheduleItemContent, // Chỉ áp dụng kiểu cho nội dung lịch thi
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
    </View>
  );

  const handleAddSchedule = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setNewSchedule({
      id: '',
      day: new Date(),
      course: '',
      period: '',
      group: '',
      room: '',
      instructor: '',
      isExam: false,
    });
  };

  const handleSaveSchedule = async () => {
    setLoading(true);
    try {
      const scheduleRef = firestore().collection('schedules').doc();
      const schedule = {
        ...newSchedule,
        id: scheduleRef.id,
        uid: user?.uid,
      };
      await scheduleRef.set(schedule);
      console.log('New schedule added:', schedule);
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || newSchedule.day;
    setShowDatePicker(Platform.OS === 'ios');
    setNewSchedule({...newSchedule, day: currentDate});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch học/ Lịch</Text>
        <TouchableOpacity onPress={handleAddSchedule} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
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
        keyExtractor={item => item.id}
        style={styles.scheduleContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Thêm lịch mới</Text>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}>
              <Text>{newSchedule.day.toLocaleDateString('en-GB')}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={newSchedule.day}
                mode="date"
                display="default"
                onChange={handleDateChange}
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
              <Text>Lịch thi</Text>
              <Switch
                value={newSchedule.isExam}
                onValueChange={value =>
                  setNewSchedule({...newSchedule, isExam: value})
                }
              />
            </View>
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

      {loading && <LoadingModal visible={loading} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
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
  weekDaysWrapper: {
    height: 80,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  weekDaysContainer: {
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 6,
    height: 60,
  },
  selectedDayButton: {
    backgroundColor: '#8A2BE2',
  },
  weekendDayButton: {},
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  dateText: {
    fontSize: 16,
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
  datePickerButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  examText: {
    color: 'red', // Red color for exams
  },
  examScheduleItem: {
    backgroundColor: '#ffeb3b', // Màu vàng cho lịch thi
  },
  examScheduleItemContent: {
    backgroundColor: '#ffeb3b', // Màu vàng cho nội dung lịch thi
  },
});

export default Teamwork;

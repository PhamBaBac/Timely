import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Alert,
  Platform,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {addDays, format, isBefore} from 'date-fns';
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
import useCustomStatusBar from '../../hooks/useCustomStatusBar';
import {appColors} from '../../constants';

// Định nghĩa period order ở ngoài component để tránh tạo lại mỗi lần render
const PERIOD_ORDER: {[key: string]: number} = {
  '1-3': 1,
  '4-6': 2,
  '7-9': 3,
  '10-12': 4,
  '13-15': 5,
};

const PERIODS = ['1-3', '4-6', '7-9', '10-12', '13-15'];
const CELL_WIDTH = Dimensions.get('window').width / 2.5; // Dynamically calculate cell width
const CELL_HEIGHT = 150;

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
  useCustomStatusBar('light-content', appColors.primary);
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

  const checkScheduleConflict = useCallback(
    (scheduleToCheck: ScheduleModel) => {
      // Get all dates between start and end date
      const dates = calculateRepeatedDates(
        scheduleToCheck.startDate,
        scheduleToCheck.endDate,
      );

      // Check each date for conflicts
      for (const date of dates) {
        const dateString = date.toISOString().split('T')[0];
        const formattedDate = format(date, 'dd/MM/yyyy');

        // Find schedules on this date
        const schedulesOnDate = schedules.flatMap(schedule => {
          const repeatedDates = calculateRepeatedDates(
            schedule.startDate,
            schedule.endDate,
          );
          return repeatedDates
            .filter(
              repeatedDate =>
                repeatedDate.toISOString().split('T')[0] === dateString,
            )
            .map(() => schedule);
        });

        // Skip checking against the schedule being edited
        const conflictingSchedules = schedulesOnDate.filter(
          schedule => schedule.id !== scheduleToCheck.id,
        );

        // Check for period conflicts
        for (const existingSchedule of conflictingSchedules) {
          if (existingSchedule.period === scheduleToCheck.period) {
            return {
              hasConflict: true,
              date: formattedDate,
              conflictingCourse: existingSchedule.course,
            };
          }
        }
      }

      return {hasConflict: false};
    },
    [schedules, calculateRepeatedDates],
  );

  const filteredScheduleItems = useMemo(() => {
    // Check if the displayed week is the current week
    const isCurrentWeek = weekDays.some(
      day => day.date === getTodayString().split('T')[0],
    );

    return schedules
      .flatMap(item => {
        const repeatedDates = calculateRepeatedDates(
          item.startDate,
          item.endDate,
        );
        return repeatedDates.map(date => ({
          ...item,
          day: date,
          startDate: date,
          endDate: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          // Add full date display for non-current week
          fullDateDisplay: isCurrentWeek
            ? null
            : format(date, 'EEEE, dd/MM/yyyy'),
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
  }, [
    schedules,
    selectedDay,
    weekDays,
    calculateRepeatedDates,
    getTodayString,
  ]);

  const handleDeleteSchedule = useCallback(
    (scheduleId: string) => {
      const scheduleToDelete = schedules.find(s => s.id === scheduleId);

      if (!scheduleToDelete) {
        Alert.alert('Lỗi', 'Không tìm thấy lịch học này.');
        return;
      }

      Alert.alert('Xóa lịch học', 'Bạn muốn xóa lịch học này như thế nào?', [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Chỉ xóa ngày này',
          onPress: async () => {
            setLoading(true);
            try {
              const dateToDelete = scheduleToDelete.startDate;
              const repeatedDates = calculateRepeatedDates(
                scheduleToDelete.startDate,
                scheduleToDelete.endDate,
              );

              // If only one date exists, delete entire schedule
              if (repeatedDates.length <= 1) {
                await firestore()
                  .collection('schedules')
                  .doc(scheduleId)
                  .delete();
              } else {
                // Update start/end dates to exclude deleted date
                const newStartDate = repeatedDates
                  .filter(date => date.getTime() !== dateToDelete.getTime())
                  .reduce((earliest, current) =>
                    current < earliest ? current : earliest,
                  );

                const newEndDate = repeatedDates
                  .filter(date => date.getTime() !== dateToDelete.getTime())
                  .reduce((latest, current) =>
                    current > latest ? current : latest,
                  );

                await firestore()
                  .collection('schedules')
                  .doc(scheduleId)
                  .update({
                    startDate: newStartDate,
                    endDate: newEndDate,
                  });
              }

              await fetchSchedules();
              Alert.alert('Thành công', 'Đã xóa lịch học thành công.');
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
        },
        {
          text: 'Xóa tất cả',
          onPress: async () => {
            setLoading(true);
            try {
              await firestore()
                .collection('schedules')
                .doc(scheduleId)
                .delete();
              await fetchSchedules();
              Alert.alert('Thành công', 'Đã xóa tất cả lịch học thành công.');
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
    [schedules, fetchSchedules, calculateRepeatedDates],
  );

  const handleSaveSchedule = useCallback(async () => {
    if (!user?.uid) return;

    // Check for required fields
    if (!newSchedule.period || !newSchedule.course) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin tiết học và môn học.');
      return;
    }

    // Check for schedule conflicts
    const conflict = checkScheduleConflict(newSchedule);
    if (conflict.hasConflict) {
      Alert.alert(
        'Trùng lịch',
        `Ngày ${conflict.date} đã có lịch học môn "${conflict.conflictingCourse}" trong tiết ${newSchedule.period}. Vui lòng chọn tiết học khác.`,
      );
      return;
    }

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
  }, [newSchedule, user?.uid, fetchSchedules, checkScheduleConflict]);

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

  useEffect(() => {
    setSelectedDay(getTodayString());
  }, [getTodayString]);

  function renderTimetableGrid(): React.ReactNode {
    return (
      <ScrollView
        horizontal
        contentContainerStyle={styles.timetableScrollContainer}
        showsHorizontalScrollIndicator={false}>
        <View style={styles.timetableContainer}>
          <View style={styles.timetableHeader}>
            {[
              '',
              'Thứ Hai',
              'Thứ Ba',
              'Thứ Tư',
              'Thứ Năm',
              'Thứ Sáu',
              'Thứ Bảy',
              'Chủ Nhật',
            ].map((day, index) => (
              <Text
                key={day}
                style={[
                  styles.timetableHeaderText,
                  index === 0 && {width: 50}, // First column for periods
                ]}>
                {day}
              </Text>
            ))}
          </View>
          <ScrollView>
            {PERIODS.map(period => (
              <View key={period} style={styles.periodRow}>
                <Text style={styles.periodText}>{period}</Text>
                {[
                  'Thứ Hai',
                  'Thứ Ba',
                  'Thứ Tư',
                  'Thứ Năm',
                  'Thứ Sáu',
                  'Thứ Bảy',
                  'Chủ Nhật',
                ].map(day => {
                  const schedulesInCell = filteredScheduleItems.filter(
                    schedule => {
                      const scheduleDay = schedule.day.getDay();
                      const dayMap = {
                        'Thứ Hai': 1,
                        'Thứ Ba': 2,
                        'Thứ Tư': 3,
                        'Thứ Năm': 4,
                        'Thứ Sáu': 5,
                        'Thứ Bảy': 6,
                        'Chủ Nhật': 0,
                      };
                      return (
                        schedule.period === period &&
                        scheduleDay === dayMap[day as keyof typeof dayMap]
                      );
                    },
                  );

                  return (
                    <TouchableOpacity
                      key={`${period}-${day}`}
                      style={[
                        styles.timetableCell,
                        {
                          minHeight: CELL_HEIGHT,
                          height: CELL_HEIGHT,
                          width: CELL_WIDTH,
                          backgroundColor: schedulesInCell.some(s => s.isExam)
                            ? '#FFF3E0' // Softer light orange for exam cell
                            : 'white',
                        },
                      ]}
                      onPress={() => {
                        const matchingSchedule =
                          schedulesInCell.length > 0
                            ? schedulesInCell[0]
                            : null;

                        if (matchingSchedule) {
                          handleSchedulePress(matchingSchedule);
                        } else {
                          setNewSchedule({
                            ...DEFAULT_SCHEDULE,
                            period: period,
                            day: new Date(),
                          });
                          setModalVisible(true);
                        }
                      }}>
                      {schedulesInCell.map(schedule => (
                        <View
                          key={schedule.id}
                          style={[
                            styles.scheduleInCell,
                            schedule.isExam && styles.examSchedule,
                          ]}>
                          <Text
                            style={[
                              styles.scheduleCellText,
                              schedule.isExam && styles.examScheduleText,
                            ]}
                            numberOfLines={1}>
                            {schedule.course}
                          </Text>
                          <Text
                            style={styles.scheduleCellSubtext}
                            numberOfLines={1}>
                            Phòng: {schedule.room}
                          </Text>
                          <Text
                            style={styles.scheduleCellSubtext}
                            numberOfLines={1}>
                            Nhóm: {schedule.group}
                          </Text>
                          <Text
                            style={styles.scheduleCellSubtext}
                            numberOfLines={1}>
                            GV: {schedule.instructor}
                          </Text>
                          {schedule.fullDateDisplay && (
                            <Text style={styles.dateSubtext} numberOfLines={1}>
                              {schedule.fullDateDisplay}
                            </Text>
                          )}
                          {schedule.isExam && (
                            <Text
                              style={[
                                styles.scheduleCellSubtext,
                                styles.examBadge,
                              ]}
                              numberOfLines={1}>
                              Thi
                            </Text>
                          )}
                        </View>
                      ))}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScheduleHeader
        onTodayPress={setCurrentWeekToToday}
        onAddPress={handleAddNewSchedule}
      />

      {renderTimetableGrid()}

      <ScheduleFormModal
        visible={modalVisible}
        schedule={newSchedule}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveSchedule}
        onDelete={handleDeleteSchedule}
        onScheduleChange={setNewSchedule}
        onStartDatePickerChange={(event: any, date?: Date) =>
          handleDatePickerChange('start', event, date)
        }
        onEndDatePickerChange={(event: any, date?: Date) =>
          handleDatePickerChange('end', event, date)
        }
        setShowStartDatePicker={setShowStartDatePicker}
        setShowEndDatePicker={setShowEndDatePicker}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  timetableScrollContainer: {
    flexGrow: 1,
  },
  timetableContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  timetableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f4f8',
    paddingVertical: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  timetableHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 14,
  },
  periodRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  periodText: {
    width: 60,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#34495e',
    padding: 10,
    fontSize: 12,
  },
  timetableCell: {
    flex: 1,
    minWidth: 140,
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#e8eaed',
    borderRadius: 10, // Add rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scheduleInCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f0f4f8', // Soft background for the schedule
  },
  scheduleCellText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50', // Darker, more professional color
    textAlign: 'center',
    marginBottom: 4,
  },
  scheduleCellSubtext: {
    fontSize: 11,
    color: '#34495e',
    textAlign: 'center',
    marginVertical: 2,
  },
  examSchedule: {
    backgroundColor: '#FFF3E0', // Softer exam schedule background
    borderWidth: 1,
    borderColor: '#FFE0B2', // Light orange border for exam
  },
  examScheduleText: {
    color: '#D84315', // Deep orange for exam schedule text
  },
  examBadge: {
    backgroundColor: '#FFE0B2', // Soft orange badge background
    color: '#BF360C', // Dark red text
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    fontWeight: 'bold',
    fontSize: 10,
    alignSelf: 'center',
  },
  dateSubtext: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default Teamwork;

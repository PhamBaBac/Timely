import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  Share,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Calendar} from 'react-native-calendars';
import {ScheduleModel} from '../models/ScheduleModel';
import {appColors} from '../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';

interface ScheduleFormModalProps {
  visible: boolean;

  schedule: ScheduleModel;

  onClose: () => void;

  onSave: () => void;

  onDelete: (scheduleId: string) => void;

  onScheduleChange: (schedule: ScheduleModel) => void;

  setShowStartDatePicker: (show: boolean) => void;

  setShowEndDatePicker: (show: boolean) => void;

  onShare?: () => void;

  onStartDatePickerChange: (event: any, date?: Date) => void;

  onEndDatePickerChange: (event: any, date?: Date) => void;
}

interface ValidationErrors {
  course: string;
  period: string;
  room: string;
  instructor: string;
  dates: string;
}

const PERIOD_OPTIONS = [
  {label: 'Tiết 1-3', value: '1-3', time: '6:30-9:00'},
  {label: 'Tiết 4-6', value: '4-6', time: '9:05-11:30'},
  {label: 'Tiết 7-9', value: '7-9', time: '12:30-15:00'},
  {label: 'Tiết 10-12', value: '10-12', time: '15:00-17:40'},
  {label: 'Tiết 13-15', value: '13-15', time: '18:00-20:30'},
];

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  visible,
  schedule,
  onClose,
  onSave,
  onDelete,
  onScheduleChange,
  onShare,
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({
    course: '',
    period: '',
    room: '',
    instructor: '',
    dates: '',
  });

  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Update end date when start date changes
  useEffect(() => {
    if (schedule.endDate < schedule.startDate) {
      onScheduleChange({
        ...schedule,
        endDate: schedule.startDate,
      });
    }
  }, [schedule.startDate]);

  const handleShare = async () => {
    try {
      const periodInfo = PERIOD_OPTIONS.find(p => p.value === schedule.period);

      // Lấy thông tin email từ Firebase
      const currentUser = auth().currentUser;
      const userEmail = currentUser ? currentUser.email : 'Không rõ email';

      const shareMessage = `
      Tài khoản: ${userEmail}
${schedule.isExam ? 'Lịch thi' : 'Lịch học'}:
Môn: ${schedule.course}
Thời gian: ${schedule.startDate.toLocaleDateString()} - ${schedule.endDate.toLocaleDateString()}
${schedule.isExam ? 'Ca thi' : 'Tiết học'}: ${
        periodInfo
          ? `${periodInfo.label} (${periodInfo.time})`
          : schedule.period
      }
Phòng: ${schedule.room}
${schedule.isExam ? 'Giám thị' : 'Giảng viên'}: ${schedule.instructor}
${schedule.group ? `Nhóm: ${schedule.group}` : ''}

    `;

      const result = await Share.share({
        message: shareMessage,
      });

      if (result.action === Share.sharedAction) {
        // shared successfully
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert('Lỗi chia sẻ', error.message);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      course: '',
      period: '',
      room: '',
      instructor: '',
      dates: '',
    };
    let isValid = true;

    if (!schedule.course.trim()) {
      newErrors.course = schedule.isExam
        ? 'Vui lòng nhập môn thi'
        : 'Vui lòng nhập môn học';
      isValid = false;
    }

    if (!schedule.period) {
      newErrors.period = schedule.isExam
        ? 'Vui lòng chọn ca thi'
        : 'Vui lòng chọn tiết học';
      isValid = false;
    }

    if (!schedule.room.trim()) {
      newErrors.room = schedule.isExam
        ? 'Vui lòng nhập phòng thi'
        : 'Vui lòng nhập phòng học';
      isValid = false;
    }

    if (!schedule.instructor.trim()) {
      newErrors.instructor = schedule.isExam
        ? 'Vui lòng nhập tên giám thị'
        : 'Vui lòng nhập tên giảng viên';
      isValid = false;
    }

    if (schedule.endDate < schedule.startDate) {
      newErrors.dates = 'Ngày kết thúc không thể trước ngày bắt đầu';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa lịch này không?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xóa',
        onPress: () => {
          onDelete(id);
          onClose();
        },
        style: 'destructive',
      },
    ]);
  };

  const renderCalendarModal = (
    isStart: boolean,
    show: boolean,
    onClose: () => void,
  ) => {
    const currentDate = isStart ? schedule.startDate : schedule.endDate;
    const minimumDate = isStart ? undefined : schedule.startDate;

    return (
      <Modal
        visible={show}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.calendarModalContainer}>
          <View style={styles.calendarModalContent}>
            <Calendar
              current={currentDate.toISOString()}
              minDate={minimumDate?.toISOString()}
              onDayPress={(day: {timestamp: number}) => {
                const newDate = new Date(day.timestamp);
                if (isStart) {
                  onScheduleChange({...schedule, startDate: newDate});
                } else {
                  onScheduleChange({...schedule, endDate: newDate});
                }
                onClose();
              }}
              monthFormat={'MM yyyy'}
              firstDay={1}
              enableSwipeMonths={true}
              theme={{
                todayTextColor: '#007AFF',
                selectedDayBackgroundColor: '#007AFF',
                'stylesheet.calendar.header': {
                  dayTextAtIndex0: {
                    color: 'red',
                  },
                  dayTextAtIndex6: {
                    color: 'red',
                  },
                },
              }}
              dayNames={['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']}
              monthNames={[
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
              ]}
            />
            <TouchableOpacity
              style={styles.calendarCloseButton}
              onPress={onClose}>
              <Text style={styles.calendarCloseButton}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderDatePicker = (isStart: boolean) => {
    const currentDate = isStart ? schedule.startDate : schedule.endDate;
    const show = isStart ? showStartCalendar : showEndCalendar;
    const setShow = isStart ? setShowStartCalendar : setShowEndCalendar;

    return (
      <View>
        <TouchableOpacity
          onPress={() => setShow(true)}
          style={[styles.dateButton, errors.dates ? styles.inputError : null]}>
          <Text>
            {`${currentDate.getDate()}/${
              currentDate.getMonth() + 1
            }/${currentDate.getFullYear()}`}
          </Text>
        </TouchableOpacity>
        {renderCalendarModal(isStart, show, () => setShow(false))}
        {!isStart && errors.dates ? (
          <Text style={styles.errorText}>{errors.dates}</Text>
        ) : null}
      </View>
    );
  };

  const renderPeriodPicker = () => {
    return (
      <View>
        <View
          style={[
            styles.pickerContainer,
            errors.period ? styles.inputError : null,
          ]}>
          <Picker
            selectedValue={schedule.period}
            onValueChange={(itemValue: any) => {
              onScheduleChange({...schedule, period: itemValue});
              if (itemValue) {
                setErrors(prev => ({...prev, period: ''}));
              }
            }}
            style={styles.picker}
            mode="dropdown">
            <Picker.Item
              label={schedule.isExam ? 'Chọn ca thi' : 'Chọn tiết học'}
              value=""
            />
            {PERIOD_OPTIONS.map(option => (
              <Picker.Item
                key={option.value}
                label={`${option.label} (${option.time})`}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
        {errors.period ? (
          <Text style={styles.errorText}>{errors.period}</Text>
        ) : null}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.headerText}>
                {schedule.id ? 'Chỉnh sửa lịch' : 'Thêm lịch'}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Lịch thi</Text>
              <Switch
                value={schedule.isExam}
                onValueChange={value =>
                  onScheduleChange({...schedule, isExam: value})
                }
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={schedule.isExam ? '#007AFF' : '#f4f3f4'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {schedule.isExam ? 'Môn thi' : 'Môn học'}
              </Text>
              <TextInput
                style={[styles.input, errors.course ? styles.inputError : null]}
                value={schedule.course}
                onChangeText={text => {
                  onScheduleChange({...schedule, course: text});
                  if (text.trim()) {
                    setErrors(prev => ({...prev, course: ''}));
                  }
                }}
                placeholder={
                  schedule.isExam ? 'Nhập tên môn thi' : 'Nhập tên môn học'
                }
              />
              {errors.course ? (
                <Text style={styles.errorText}>{errors.course}</Text>
              ) : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Thời gian bắt đầu</Text>
              {renderDatePicker(true)}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Thời gian kết thúc</Text>
              {renderDatePicker(false)}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {schedule.isExam ? 'Ca thi' : 'Tiết học'}
              </Text>
              {renderPeriodPicker()}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nhóm</Text>
              <TextInput
                style={styles.input}
                value={schedule.group}
                onChangeText={text =>
                  onScheduleChange({...schedule, group: text})
                }
                placeholder="Nhập nhóm"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {schedule.isExam ? 'Phòng thi' : 'Phòng học'}
              </Text>
              <TextInput
                style={[styles.input, errors.room ? styles.inputError : null]}
                value={schedule.room}
                onChangeText={text => {
                  onScheduleChange({...schedule, room: text});
                  if (text.trim()) {
                    setErrors(prev => ({...prev, room: ''}));
                  }
                }}
                placeholder={
                  schedule.isExam ? 'Nhập phòng thi' : 'Nhập phòng học'
                }
              />
              {errors.room ? (
                <Text style={styles.errorText}>{errors.room}</Text>
              ) : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {schedule.isExam ? 'Giám thị' : 'Giảng viên'}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.instructor ? styles.inputError : null,
                ]}
                value={schedule.instructor}
                onChangeText={text => {
                  onScheduleChange({...schedule, instructor: text});
                  if (text.trim()) {
                    setErrors(prev => ({...prev, instructor: ''}));
                  }
                }}
                placeholder={
                  schedule.isExam ? 'Nhập tên giám thị' : 'Nhập tên giảng viên'
                }
              />
              {errors.instructor ? (
                <Text style={styles.errorText}>{errors.instructor}</Text>
              ) : null}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>

              {schedule.id && (
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => handleDelete(schedule.id)}>
                  <Text style={styles.buttonText}>Xóa</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={handleShare}>
                <MaterialCommunityIcons
                  name="share-variant"
                  size={20}
                  color="white"
                  style={{marginRight: 8}}
                />
                <Text style={styles.buttonText}>Chia sẻ</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  closeButtonText: {
    fontSize: 22,
    color: '#495057',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#495057',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#212529',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 12,
    padding: 14,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputError: {
    borderColor: '#FA5252',
    backgroundColor: '#FFF5F5',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  saveButton: {
    backgroundColor: '#228BE6',
  },
  deleteButton: {
    backgroundColor: '#FA5252',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  errorText: {
    color: '#FA5252',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: 'white',
  },
  calendarModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  calendarModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  calendarCloseButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 12,
    zIndex: 1,
    backgroundColor: appColors.primary,
    borderRadius: 12,
  },
  calendarCloseButtonIcon: {
    fontSize: 24,
    color: '#495057',
    fontWeight: '600',
  },
  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  calendarActionButton: {
    flex: 1,
    backgroundColor: '#228BE6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  calendarActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarCancelButton: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCancelButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#40C057', // A green color to distinguish it
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

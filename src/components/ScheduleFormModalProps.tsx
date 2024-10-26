import React, {useState} from 'react';
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
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {ScheduleModel} from '../models/ScheduleModel';

interface ScheduleFormModalProps {
  visible: boolean;
  schedule: ScheduleModel;
  onClose: () => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onScheduleChange: (schedule: ScheduleModel) => void;
  showStartDatePicker: boolean;
  showEndDatePicker: boolean;
  onStartDatePickerChange: (event: any, date?: Date) => void;
  onEndDatePickerChange: (event: any, date?: Date) => void;
  setShowStartDatePicker: (show: boolean) => void;
  setShowEndDatePicker: (show: boolean) => void;
}

interface ValidationErrors {
  course: string;
  period: string;
  room: string;
  instructor: string;
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
  showStartDatePicker,
  showEndDatePicker,
  onStartDatePickerChange,
  onEndDatePickerChange,
  setShowStartDatePicker,
  setShowEndDatePicker,
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({
    course: '',
    period: '',
    room: '',
    instructor: '',
  });

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      course: '',
      period: '',
      room: '',
      instructor: '',
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

  const renderDatePicker = (
    isStart: boolean,
    show: boolean,
    onShow: (show: boolean) => void,
    onChange: (event: any, date?: Date) => void,
  ) => {
    const currentDate = isStart ? schedule.startDate : schedule.endDate;
    const minimumDate = isStart ? new Date() : schedule.startDate;

    if (Platform.OS === 'ios') {
      return (
        <View>
          <TouchableOpacity
            onPress={() => onShow(true)}
            style={styles.dateButton}>
            <Text>{currentDate.toLocaleDateString('vi-VN')}</Text>
          </TouchableOpacity>
          {show && (
            <View style={styles.iosPickerContainer}>
              <DateTimePicker
                value={currentDate}
                mode="date"
                display="spinner"
                onChange={onChange}
                minimumDate={minimumDate}
              />
              <TouchableOpacity
                style={styles.iosPickerButton}
                onPress={() => onShow(false)}>
                <Text style={styles.iosPickerButtonText}>Xong</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => onShow(true)}
          style={styles.dateButton}>
          <Text>{currentDate.toLocaleDateString('vi-VN')}</Text>
        </TouchableOpacity>
        {show && (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              onShow(false);
              onChange(event, date);
            }}
            minimumDate={minimumDate}
          />
        )}
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
          <ScrollView>
            <View style={styles.header}>
              <Text style={styles.headerText}>
                {schedule.id ? 'Chỉnh sửa lịch' : 'Thêm lịch'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
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
              {renderDatePicker(
                true,
                showStartDatePicker,
                setShowStartDatePicker,
                onStartDatePickerChange,
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Thời gian kết thúc</Text>
              {renderDatePicker(
                false,
                showEndDatePicker,
                setShowEndDatePicker,
                onEndDatePickerChange,
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  formGroup: {
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: 'white',
  },
  iosPickerContainer: {
    backgroundColor: 'white',
    width: '100%',
    padding: 5,
    borderRadius: 10,
    marginTop: 5,
  },
  iosPickerButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  iosPickerButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

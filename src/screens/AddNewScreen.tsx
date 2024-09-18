import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { AddSquare, Calendar as CalendarIcon, Tag, Share, Clock, Repeat } from 'iconsax-react-native';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { appColors } from '../constants';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

LocaleConfig.locales['vi'] = {
  monthNames: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ],
  monthNamesShort: [
    'Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6',
    'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'
  ],
  dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay'
};

LocaleConfig.defaultLocale = 'vi';

const AddNewScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isRepeatModalVisible, setRepeatModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setNewCategoryModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  console.log(selectedTime);
  const [selectedRepeat, setSelectedRepeat] = useState('');
  console.log(selectedRepeat);
  const [selectedCategory, setSelectedCategory] = useState('');
  console.log(selectedCategory);
  const [newCategoryName, setNewCategoryName] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const handleOutsidePress = () => {
    setModalVisible(false);
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirmTime = (time: Date) => {
    setSelectedTime(time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    hideTimePicker();
  };

  const handleRepeatOptionSelect = (option: string) => {
    setSelectedRepeat(option);
    setRepeatModalVisible(false);
  };

  const handleCategorySelect = (category: string) => {
    if (category === 'Tạo danh mục mới') {
      setNewCategoryModalVisible(true);
    } else {
      setSelectedCategory(category);
      setCategoryModalVisible(false);
    }
  };

  const handleNewCategoryCreate = () => {
    if (newCategoryName.trim()) {
      setSelectedCategory(newCategoryName);
      setNewCategoryModalVisible(false);
      setNewCategoryName('');
      // Here you would typically also update your categories list or state
    } else {
      Alert.alert('Error', 'Please enter a category name.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nhập nhiệm vụ mới ở đây"
        placeholderTextColor={appColors.gray4}
        onChangeText={text => console.log(text)}
      />
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={() => setModalVisible(true)}>
          <CalendarIcon size={24} color={appColors.primary} />
          <Text style={styles.optionText}>Lịch </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => setCategoryModalVisible(true)}>
          <Tag size={24} color={appColors.primary} />
          <Text style={styles.optionText}>Danh mục</Text>
          <Text style={styles.selectedCategoryText}>{selectedCategory}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Share size={24} color={appColors.primary} />
          <Text style={styles.optionText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <RNCalendar
                  style={styles.calendar}
                  current={date}
                  
                  onDayPress={(day: { dateString: string }) => setDate(day.dateString)}
                />
                <View style={styles.modalOptions}>
                  <TouchableOpacity style={styles.modalOption} onPress={showTimePicker}>
                    <Clock size={24} color={appColors.primary} />
                    <Text style={styles.modalOptionText}>Chọn thời gian</Text>
                    <Text style={styles.selectedTimeText}>{selectedTime}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalOption} onPress={() => setRepeatModalVisible(true)}>
                    <Repeat size={24} color={appColors.primary} />
                    <Text style={styles.modalOptionText}>Chọn lặp lại</Text>
                    <Text style={styles.selectedRepeatText}>{selectedRepeat}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={isRepeatModalVisible}
        animationType="slide"
        onRequestClose={() => setRepeatModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setRepeatModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.repeatModalContent}>
                <Text style={styles.repeatOptionText} onPress={() => handleRepeatOptionSelect('Lặp lại mỗi giờ')}>Lặp lại mỗi giờ</Text>
                <Text style={styles.repeatOptionText} onPress={() => handleRepeatOptionSelect('Lặp lại mỗi ngày')}>Lặp lại mỗi ngày</Text>
                <Text style={styles.repeatOptionText} onPress={() => handleRepeatOptionSelect('Lặp lại mỗi tuần')}>Lặp lại mỗi tuần</Text>
                <Text style={styles.repeatOptionText} onPress={() => handleRepeatOptionSelect('Lặp lại mỗi tháng')}>Lặp lại mỗi tháng</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={isCategoryModalVisible}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setCategoryModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.categoryModalContent}>
                <TouchableOpacity style={styles.categoryOption} onPress={() => handleCategorySelect('Tất cả')}>
                  <MaterialIcons name="category" size={24} color={appColors.primary} />
                  <Text style={styles.categoryOptionText}>Tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryOption} onPress={() => handleCategorySelect('Công việc')}>
                  <MaterialIcons name="work" size={24} color={appColors.primary} />
                  <Text style={styles.categoryOptionText}>Công việc</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryOption} onPress={() => handleCategorySelect('Sinh nhật')}>
                  <MaterialIcons name="celebration" size={24} color={appColors.primary} />
                  <Text style={styles.categoryOptionText}>Sinh nhật</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.categoryOption} onPress={() => handleCategorySelect('Tạo danh mục mới')}>
                  <MaterialIcons name="add-box" size={24} color={appColors.primary} />
                  <Text style={styles.categoryOptionText}>Tạo danh mục mới</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={isNewCategoryModalVisible}
        animationType="slide"
        onRequestClose={() => setNewCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setNewCategoryModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên danh mục mới"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <TouchableOpacity style={styles.button} onPress={handleNewCategoryCreate}>
                  <Text style={styles.buttonText}>Tạo danh mục</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={hideTimePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: appColors.gray2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: appColors.primary,
  },
  selectedCategoryText: {
    marginLeft: 10,
    fontSize: 16,
    color: appColors.black,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  calendar: {
    width: '100%',
    height: 350,
    marginBottom: 20,
  },
  modalOptions: {
    width: '100%',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  modalOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: appColors.primary,
  },
  selectedTimeText: {
    marginLeft: 100,
    fontSize: 16,
    color: appColors.black,
  },
  repeatModalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  repeatOptionText: {
    fontSize: 16,
    color: appColors.primary,
    marginVertical: 10,
  },
  selectedRepeatText: {
    marginLeft: 100,
    fontSize: 16,
    color: appColors.black,
  },
  categoryModalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  categoryOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: appColors.primary,
  },
  button: {
    backgroundColor: appColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default AddNewScreen;

import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from 'react-native';
import {appColors} from '../constants';

interface RepeatModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectRepeat: (
    repeat: 'no' | 'day' | 'week' | 'month',
    label: string,
    selectedDays?: string[],
  ) => void;
  defaultSelectedDays?: string[];
}

export const RepeatModal = ({
  isVisible,
  onClose,
  onSelectRepeat,
  defaultSelectedDays = [],
}: RepeatModalProps) => {
  const [showWeekDays, setShowWeekDays] = useState(false);
  const [selectedDays, setSelectedDays] =
    useState<string[]>(defaultSelectedDays);

  const weekDays = [
    {id: 'CN', label: 'CN', fullLabel: 'Chủ Nhật'},
    {id: 'T2', label: 'T2', fullLabel: 'Thứ 2'},
    {id: 'T3', label: 'T3', fullLabel: 'Thứ 3'},
    {id: 'T4', label: 'T4', fullLabel: 'Thứ 4'},
    {id: 'T5', label: 'T5', fullLabel: 'Thứ 5'},
    {id: 'T6', label: 'T6', fullLabel: 'Thứ 6'},
    {id: 'T7', label: 'T7', fullLabel: 'Thứ 7'},
  ];

  const toggleWeekDay = (dayId: string) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId],
    );
  };

  const selectAllDays = () => {
    setSelectedDays(weekDays.map(day => day.id));
  };

  const unselectAllDays = () => {
    setSelectedDays([]);
  };

  const handleSelectWeeklyRepeat = () => {
    if (defaultSelectedDays.length > 0) {
      setSelectedDays(defaultSelectedDays);
    }
    setShowWeekDays(true);
  };

  const handleConfirmWeekDays = () => {
    if (selectedDays.length > 0) {
      const sortedDays = selectedDays.sort((a, b) => {
        const aIndex = weekDays.findIndex(day => day.id === a);
        const bIndex = weekDays.findIndex(day => day.id === b);
        return aIndex - bIndex;
      });

      const fullLabels = sortedDays
        .map(dayId => weekDays.find(day => day.id === dayId)?.fullLabel)
        .join(', ');

      const daysLabel = `Lặp lại vào: ${fullLabels}`;
      onSelectRepeat('week', daysLabel, sortedDays);
      setShowWeekDays(false);
    }
  };

  const handleClose = () => {
    setShowWeekDays(false);
    setSelectedDays(defaultSelectedDays);
    onClose();
  };

  const handleSelectOption = (type: 'no' | 'day' | 'month', label: string) => {
    let displayLabel = '';
    switch (type) {
      case 'no':
        displayLabel = 'Không lặp lại';
        break;
      case 'day':
        displayLabel = 'Lặp lại mỗi ngày';
        break;
      case 'month':
        displayLabel = 'Lặp lại mỗi tháng';
        break;
    }
    onSelectRepeat(type, displayLabel);
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.repeatModalContent}>
              {!showWeekDays ? (
                <>
                  <Text style={styles.modalTitle}>Chọn tùy chọn lặp lại</Text>
                  <TouchableOpacity
                    style={styles.repeatOption}
                    onPress={() => handleSelectOption('no', 'Không')}>
                    <Text style={styles.repeatOptionText}>Không lặp lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.repeatOption}
                    onPress={() => handleSelectOption('day', 'Ngày')}>
                    <Text style={styles.repeatOptionText}>
                      Lặp lại mỗi ngày
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.repeatOption}
                    onPress={handleSelectWeeklyRepeat}>
                    <Text style={styles.repeatOptionText}>
                      Lặp lại theo thứ
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.repeatOption}
                    onPress={() => handleSelectOption('month', 'Tháng')}>
                    <Text style={styles.repeatOptionText}>
                      Lặp lại mỗi tháng
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.weekDaysTitle}>
                    Chọn các ngày trong tuần
                  </Text>
                  <View style={styles.selectAllContainer}>
                    <TouchableOpacity
                      style={styles.selectAllButton}
                      onPress={selectAllDays}>
                      <Text style={styles.selectAllButtonText}>
                        Chọn tất cả
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.selectAllButton}
                      onPress={unselectAllDays}>
                      <Text style={styles.selectAllButtonText}>
                        Bỏ chọn tất cả
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.weekDaysContainer}>
                    {weekDays.map(day => (
                      <TouchableOpacity
                        key={day.id}
                        style={[
                          styles.dayButton,
                          selectedDays.includes(day.id) &&
                            styles.selectedDayButton,
                        ]}
                        onPress={() => toggleWeekDay(day.id)}>
                        <Text
                          style={[
                            styles.dayButtonText,
                            selectedDays.includes(day.id) &&
                              styles.selectedDayText,
                          ]}>
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => setShowWeekDays(false)}>
                      <Text style={styles.buttonText}>Quay lại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.confirmButton,
                        selectedDays.length === 0 && styles.disabledButton,
                      ]}
                      disabled={selectedDays.length === 0}
                      onPress={handleConfirmWeekDays}>
                      <Text
                        style={[styles.buttonText, styles.confirmButtonText]}>
                        Xác nhận
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  repeatModalContent: {
    width: '100%',
    maxWidth: Math.min(400, width - 32), // Giới hạn chiều rộng tối đa
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.black,
    marginBottom: 15,
    textAlign: 'center',
  },
  repeatOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  repeatOptionText: {
    fontSize: 16,
    color: appColors.primary,
  },
  weekDaysTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: appColors.black,
    textAlign: 'center',
  },
  selectAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  selectAllButton: {
    backgroundColor: appColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  selectAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dayButton: {
    width: (width - 120) / 7, // Tính toán chiều rộng dựa trên màn hình
    aspectRatio: 1, // Giữ tỷ lệ 1:1 cho nút
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  selectedDayButton: {
    backgroundColor: appColors.primary,
  },
  dayButtonText: {
    fontSize: 14,
    color: appColors.gray,
  },
  selectedDayText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: appColors.primary,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    fontSize: 14,
    color: appColors.gray,
  },
  confirmButtonText: {
    color: 'white',
  },
});

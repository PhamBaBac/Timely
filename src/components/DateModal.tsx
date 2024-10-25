import React from 'react';
import {Modal, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import {Calendar as RNCalendar} from 'react-native-calendars';
import {appColors} from '../constants';

interface DateModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onDateSelect: (date: any) => void;
}

export const DateModal = ({
  isVisible,
  onClose,
  selectedDate,
  onDateSelect,
}: DateModalProps) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <RNCalendar
                style={styles.calendar}
                onDayPress={onDateSelect}
                markedDates={{
                  [selectedDate
                    ? selectedDate.toISOString().split('T')[0]
                    : '']: {
                    selected: true,
                    selectedColor: appColors.primary,
                  },
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  },
});

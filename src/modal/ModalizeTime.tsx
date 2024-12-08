// src/components/ModalizeTime.tsx
import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import DatePicker from 'react-native-date-picker';
import {RowComponent, TextComponent} from '../components';
import {appColors} from '../constants';
import { format } from 'date-fns';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ModalizeTimeProps {
  visible: boolean;
  onClose: () => void;
  selectedTime: Date;
  onTimeChange: (time: Date) => void;
  selectedDate: Date | null; 
  closeOnOverlayTap?: boolean;
}

const ModalizeTime: React.FC<ModalizeTimeProps> = ({
  visible,
  onClose,
  selectedTime,
  onTimeChange,
  selectedDate, 
  closeOnOverlayTap = false,
}) => {
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };
  const modalizeTimeRef = useRef<Modalize>(null);
  console.log("selectedTimeaaaaa", formatTime(selectedTime));

  useEffect(() => {
    if (visible) {
      modalizeTimeRef.current?.open();
    } else {
      modalizeTimeRef.current?.close();
    }
  }, [visible]);

  // Handle time change and combine with the selected date
  const handleTimeChange = (time: Date) => {
    if (selectedDate) {
      // Combine selected date and the new time
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(time.getHours());
      newDateTime.setMinutes(time.getMinutes());
      newDateTime.setSeconds(time.getSeconds());
      onTimeChange(newDateTime);
      console.log("newDateTime", newDateTime);
    } else {
      onTimeChange(time); // Fallback if no date is selected
    }
  };

  return (
    <Portal>
      <Modalize
        ref={modalizeTimeRef}
        adjustToContentHeight
        onClosed={onClose}
        closeOnOverlayTap={closeOnOverlayTap}>
        <View style={styles.modalContent}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: appColors.text,
                textAlign: 'center',
                flex: 1,
              }}>
              Chọn giờ bắt đầu
            </Text>
            <MaterialIcons
              name="done"
              size={30}
              color={appColors.primary}
              onPress={onClose}
            />
          </View>
          <DatePicker
            date={selectedTime}
            mode="time"
            onDateChange={handleTimeChange} // Use the new handleTimeChange
          />
        </View>
      </Modalize>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
    paddingBottom: 80,
    alignItems: 'center',
  },
});

export default ModalizeTime;

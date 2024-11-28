// src/components/ModalizeTime.tsx
import React, {useRef, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import DatePicker from 'react-native-date-picker';
import {RowComponent, TextComponent} from '../components';
import {appColors} from '../constants';
import { format } from 'date-fns';

interface ModalizeTimeProps {
  visible: boolean;
  onClose: () => void;
  selectedTime: Date;
  onTimeChange: (time: Date) => void;
  selectedDate: Date | null; // Pass selected date from ModalizeDate
}

const ModalizeTime: React.FC<ModalizeTimeProps> = ({
  visible,
  onClose,
  selectedTime,
  onTimeChange,
  selectedDate, // Use selectedDate to combine with the selected time
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
      <Modalize ref={modalizeTimeRef} adjustToContentHeight onClosed={onClose}>
        <View style={styles.modalContent}>  
          <RowComponent>
            <TextComponent
              text="Chọn giờ bắt đầu"
              color={appColors.text}
              styles={{
                fontSize: 16,
                fontWeight: 'bold',
                color: appColors.text,
                flex: 1,
                textAlign: 'center',
                paddingLeft: 10,
              }}
            />
          </RowComponent>
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

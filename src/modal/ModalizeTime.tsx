// src/components/ModalizeTime.tsx
import React, {useRef, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import DatePicker from 'react-native-date-picker';
import { RowComponent, TextComponent } from '../components';
import { appColors } from '../constants';
import { format } from 'date-fns';

interface ModalizeTimeProps {
  visible: boolean;
  onClose: () => void;
  selectedTime: Date;
  onTimeChange: (time: Date) => void;
}


const ModalizeTime: React.FC<ModalizeTimeProps> = ({
  visible,
  onClose,
  selectedTime,
  onTimeChange,
}) => {
  const modalizeTimeRef = useRef<Modalize>(null);

  useEffect(() => {
    if (visible) {
      modalizeTimeRef.current?.open();
    } else {
      modalizeTimeRef.current?.close();
    }
  }, [visible]);

  console.log('selectedTime', format(selectedTime, 'HH:mm'));
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
            onDateChange={onTimeChange}
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

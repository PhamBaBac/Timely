// src/components/ModalizeDate.tsx
import React, {useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import {Calendar as RNCalendar} from 'react-native-calendars';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../constants';

interface ModalizeDateProps {
  visible?: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  taskDetail: any;
}

const ModalizeDate: React.FC<ModalizeDateProps> = ({
  visible,
  onClose,
  selectedDate,
  onDateChange,
  taskDetail,
}) => {
  const modalizeDateRef = useRef<Modalize>(null);

  React.useEffect(() => {
    if (visible) {
      modalizeDateRef.current?.open();
    } else {
      modalizeDateRef.current?.close();
    }
  }, [visible]);

  return (
    <Portal>
      <Modalize ref={modalizeDateRef} adjustToContentHeight onClosed={onClose}>
        <View style={styles.modalContent}>
          <RNCalendar
            style={styles.calendar}
            markingType={'custom'}
            markedDates={{
              [selectedDate
                ? selectedDate.toISOString().split('T')[0]
                : taskDetail.dueDate
                ? new Date(taskDetail.dueDate).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]]: {
                selected: true,
                textColor: appColors.primary,
                selectedColor: appColors.primary,
              },
            }}
            onDayPress={({dateString}: {dateString: string}) => {
              const newSelectedDate = new Date(dateString);
              onDateChange(newSelectedDate);
            }}
            renderArrow={(direction: 'left' | 'right') => (
              <MaterialIcons
                name={
                  direction === 'left' ? 'arrow-back-ios' : 'arrow-forward-ios'
                }
                size={14}
                color={appColors.primary}
              />
            )}
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
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
  },
});

export default ModalizeDate;

import React, {useRef} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import {Calendar as RNCalendar} from 'react-native-calendars';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../constants';
import { RowComponent } from '../components';

interface ModalizeDateProps {
  visible?: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  taskDetail: any;
  closeOnOverlayTap?: boolean;
}

const ModalizeDate: React.FC<ModalizeDateProps> = ({
  visible,
  onClose,
  selectedDate,
  onDateChange,
  taskDetail,
  closeOnOverlayTap = true,
}) => {
  const modalizeDateRef = useRef<Modalize>(null);

  React.useEffect(() => {
    if (visible) {
      modalizeDateRef.current?.open();
    } else {
      modalizeDateRef.current?.close();
    }
  }, [visible]);

  // Thêm hàm này để xử lý an toàn việc format date
  const getFormattedDate = () => {
    if (selectedDate && selectedDate instanceof Date) {
      return selectedDate.toISOString().split('T')[0];
    }
    if (taskDetail?.dueDate) {
      try {
        return new Date(taskDetail.dueDate).toISOString().split('T')[0];
      } catch (e) {
        console.warn('Invalid dueDate:', taskDetail.dueDate);
      }
    }
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Portal>
      <Modalize
        ref={modalizeDateRef}
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
              Chọn ngày
            </Text>
            <MaterialIcons
              name="done"
              size={30}
              color={appColors.primary}
              onPress={onClose}
            />
          </View>
          <RNCalendar
            style={styles.calendar}
            markingType={'custom'}
            markedDates={{
              [getFormattedDate()]: {
                // Sử dụng hàm mới
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

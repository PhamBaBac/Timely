// src/components/ModalizeRepeat.tsx
import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import {
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../components';
import {appColors} from '../constants';
import {Switch} from 'react-native-gesture-handler';

interface ModalizeRepeatProps {
  visible: boolean;
  onClose: () => void;
  taskDetail: any;
  handleChangeValue: (key: string, value: any) => void;
  setSelectedRepeat: (value: string) => void;
}

const ModalizeRepeat: React.FC<ModalizeRepeatProps> = ({
  visible,
  onClose,
  taskDetail,
  handleChangeValue,
  setSelectedRepeat,
}) => {
  const modalizeRef = useRef<Modalize>(null);

  useEffect(() => {
    if (visible) {
      modalizeRef.current?.open();
    } else {
      modalizeRef.current?.close();
    }
  }, [visible]);

  const [isWeek, setIsWeek] = useState(false);

  return (
    <Portal>
      <Modalize ref={modalizeRef} adjustToContentHeight onClosed={onClose}>
        <View style={styles.repeatModalContent}>
          <RowComponent>
            <TextComponent
              text="Chọn lặp lại"
              color={appColors.text}
              styles={{
                fontSize: 16,
                fontWeight: 'bold',
                color: appColors.text,
                flex: 1,
                textAlign: 'left',
                paddingLeft: 10,
              }}
            />
            <Switch
              trackColor={{false: appColors.gray, true: appColors.primary}}
              thumbColor={
                taskDetail.repeat !== 'no' ? appColors.primary : appColors.gray2
              }
              value={taskDetail.repeat !== 'no'}
              onValueChange={val => {
                const newRepeatValue = val ? 'day' : 'no';
                handleChangeValue('repeat', newRepeatValue);
                setSelectedRepeat(val ? 'Ngày' : 'Không');
              }}
            />
          </RowComponent>
          <SpaceComponent height={20} />
          <View style={styles.repeatOptionsContainer}>
            <Text
              style={styles.repeatOptionText}
              onPress={() => {
                handleChangeValue('repeat', 'day');
                setSelectedRepeat('Ngày');
              }}>
              Hằng ngày
            </Text>
            <TextComponent
              text="|"
              color={appColors.primary}
              styles={{fontSize: 22}}
            />
            <Text
              style={styles.repeatOptionText}
              onPress={() => {
                handleChangeValue('repeat', 'week');
                setIsWeek(true);

                setSelectedRepeat('Tuần');
              }}>
              Hằng tuần
            </Text>
            <TextComponent
              text="|"
              color={appColors.primary}
              styles={{fontSize: 22}}
            />
            <Text
              style={styles.repeatOptionText}
              onPress={() => {
                handleChangeValue('repeat', 'month');
                modalizeRef.current?.close();
                setSelectedRepeat('Tháng');
              }}>
              Hằng tháng
            </Text>
          </View>
          <SpaceComponent height={20} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
              marginHorizontal: 10,
            }}>
            <TextComponent text="Số lần lặp" />
            <SpaceComponent width={10} />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={text => handleChangeValue('repeatCount', text)}
              value={
                taskDetail.repeatCount
                  ? taskDetail.repeatCount.toString()
                  : undefined
              }
            />
          </View>
          {taskDetail.repeat === 'week' && (
            <View>
              <SectionComponent>
                <TextComponent text="Chọn ngày trong tuần" />
                <View style={styles.weekDaysContainer}>
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(
                    (day, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.weekDay,
                          taskDetail.repeatDays?.includes(index) &&
                            styles.selectedDay,
                        ]}
                        onPress={() => {
                          const newRepeatDays = taskDetail.repeatDays?.includes(
                            index,
                          )
                            ? taskDetail.repeatDays.filter(
                                (d: number) => d !== index,
                              )
                            : [...(taskDetail.repeatDays || []), index];
                          handleChangeValue('repeatDays', newRepeatDays);
                        }}>
                        <TextComponent text={day} />
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </SectionComponent>
            </View>
          )}
        </View>
      </Modalize>
    </Portal>
  );
};

const styles = StyleSheet.create({
  repeatModalContent: {
    padding: 20,
    paddingBottom: 80,
  },
  repeatOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: appColors.primary,
    borderRadius: 8,
  },
  repeatOptionText: {
    fontSize: 16,
    color: appColors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: appColors.gray,
    borderRadius: 8,
    padding: 12,
    height: 40,
    
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  weekDay: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: appColors.gray,
    marginBottom: 10,
  },
  selectedDay: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
});

export default ModalizeRepeat;

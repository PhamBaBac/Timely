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
  startDate: Date;
}

const ModalizeRepeat: React.FC<ModalizeRepeatProps> = ({
  visible,
  onClose,
  taskDetail,
  handleChangeValue,
  setSelectedRepeat,
  startDate,
}) => {
  const modalizeRef = useRef<Modalize>(null);
  const [isWeek, setIsWeek] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (visible) {
      modalizeRef.current?.open();
    } else {
      modalizeRef.current?.close();
    }
  }, [visible]);

  const startDay = startDate.getDate();
  const startMonth = startDate.getMonth();

  const validateRepeatCount = (text: string) => {
    // Remove any non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText === '') {
      setIsError(true);
      setErrorMessage('Vui lòng nhập số lần lặp');
      handleChangeValue('repeatCount', '');
      return;
    }

    const number = parseInt(numericText, 10);

    if (number <= 0) {
      setIsError(true);
      setErrorMessage('Số lần lặp phải lớn hơn 0');
      handleChangeValue('repeatCount', '');
      return;
    }

    setIsError(false);
    setErrorMessage('');
    handleChangeValue('repeatCount', numericText);
  };

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
                if (!val) {
                  // Reset error state when turning off repeat
                  setIsError(false);
                  setErrorMessage('');
                }
              }}
            />
          </RowComponent>
          <SpaceComponent height={20} />
          <View style={styles.repeatOptionsContainer}>
            <Text
              style={[
                styles.repeatOptionText,
                {
                  color:
                    taskDetail.repeat === 'day'
                      ? appColors.primary
                      : appColors.text,
                },
              ]}
              onPress={() => {
                handleChangeValue('repeat', 'day');
                setSelectedRepeat('Ngày');
              }}>
              Hằng ngày
            </Text>
            <TextComponent
              text="|"
              color={appColors.text}
              styles={{fontSize: 22}}
            />
            <Text
              style={[
                styles.repeatOptionText,
                {
                  color:
                    taskDetail.repeat === 'week'
                      ? appColors.primary
                      : appColors.text,
                },
              ]}
              onPress={() => {
                handleChangeValue('repeat', 'week');
                setIsWeek(true);
                setSelectedRepeat('Tuần');
              }}>
              Hằng tuần
            </Text>
            <TextComponent
              text="|"
              color={appColors.text}
              styles={{fontSize: 22}}
            />
            <Text
              style={[
                styles.repeatOptionText,
                {
                  color:
                    taskDetail.repeat === 'month'
                      ? appColors.primary
                      : appColors.text,
                },
              ]}
              onPress={() => {
                handleChangeValue('repeat', 'month');
                setSelectedRepeat('Tháng');
              }}>
              Hằng tháng
            </Text>
          </View>
          <SpaceComponent height={20} />
          {taskDetail.repeat !== 'no' && (
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
                style={[styles.input, isError && styles.inputError]}
                keyboardType="numeric"
                onChangeText={validateRepeatCount}
                value={taskDetail.repeatCount?.toString()}
                placeholder="Nhập số lần lặp"
              />
            </View>
          )}
          {isError && (
            <TextComponent
              text={errorMessage}
              color={appColors.red}
              styles={styles.errorText}
            />
          )}

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
                          newRepeatDays.sort((a: number, b: number) => a - b);
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
          {taskDetail.repeat === 'month' && (
            <View>
              <SectionComponent>
                <TextComponent text="Chọn ngày trong tháng" />
                <View style={styles.weekDaysContainer}>
                  {[...Array(31).keys()].map((day, index) => {
                    const actualDay = day + 1;
                    const isValidDay = actualDay >= startDay;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.weekDay,
                          taskDetail.repeatDays?.includes(actualDay) &&
                            styles.selectedDay,
                          !isValidDay && styles.disabledDay,
                        ]}
                        onPress={() => {
                          if (isValidDay) {
                            const newRepeatDays =
                              taskDetail.repeatDays?.includes(actualDay)
                                ? taskDetail.repeatDays.filter(
                                    (d: number) => d !== actualDay,
                                  )
                                : [...(taskDetail.repeatDays || []), actualDay];
                            newRepeatDays.sort((a: number, b: number) => a - b);
                            handleChangeValue('repeatDays', newRepeatDays);
                          }
                        }}>
                        <TextComponent text={actualDay.toString()} />
                      </TouchableOpacity>
                    );
                  })}
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
    borderColor: appColors.text,
    borderRadius: 8,
  },
  repeatOptionText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: appColors.gray,
    borderRadius: 8,
    padding: 12,
    height: 40,
    width: 50,
  },
  inputError: {
    borderColor: appColors.red,
  },
  errorText: {
    marginLeft: 10,
    marginBottom: 10,
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
  disabledDay: {
    backgroundColor: appColors.gray2,
    borderColor: appColors.gray2,
  },
});

export default ModalizeRepeat;

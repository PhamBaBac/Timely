import {differenceInDays, differenceInMonths, differenceInYears, format} from 'date-fns';
import {Calendar1, Calendar as CalendarIcon} from 'iconsax-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Switch} from 'react-native-gesture-handler';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import {
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../components';
import {appColors} from '../constants';
import ModalizeDate from './modalizaDate';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ModalizeRepeatProps {
  visible: boolean;
  onClose: () => void;
  taskDetail: any;
  handleChangeValue: (key: string, value: any) => void;
  setSelectedRepeat: (value: string) => void;
  startDate: Date;
  closeOnOverlayTap?: boolean;
}

const ModalizeRepeat: React.FC<ModalizeRepeatProps> = ({
  visible,
  onClose,
  taskDetail,
  handleChangeValue,
  setSelectedRepeat,
  startDate, 
  closeOnOverlayTap = false,
}) => {
  const modalizeRef = useRef<Modalize>(null);

  const [visibleEndDate, setVisibleEndDate] = useState(false);

  useEffect(() => {
    if (visible) {
      modalizeRef.current?.open();
    } else {
      modalizeRef.current?.close();
    }
  }, [visible]);
  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  const [isWeek, setIsWeek] = useState(false);

  const startDay = startDate.getDate();

  const calculateRepeatCount = (
    endDate: Date,
    intervalType: 'day' | 'week' | 'month' | 'year',
  ) => {
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);

    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(0, 0, 0, 0);

    if (intervalType === 'day') {
      const daysDifference = differenceInDays(
        normalizedEndDate,
        normalizedStartDate,
      );
      return daysDifference + 1; // Add 1 to include the start day
    } else if (intervalType === 'week') {
      const daysDifference = differenceInDays(
        normalizedEndDate,
        normalizedStartDate,
      );
      return Math.floor(daysDifference / 7) + 1;
      
      
    } else if (intervalType === 'month') {
      const monthsDifference = differenceInMonths(
        normalizedEndDate,
        normalizedStartDate,
      );
      return monthsDifference + 1; // Include the first month
    } //Lay ngay bat dau va lap qua cac nam, lap tan 10 nam la dung
    else if (intervalType === 'year') {
      const yearsDifference = differenceInYears(
        normalizedEndDate,
        normalizedStartDate,
      );
      return yearsDifference + 1; // Include the first year
    }
    return 0;
  };

  return (
    <Portal>
      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        onClosed={onClose}
        closeOnOverlayTap={closeOnOverlayTap}>
        <RowComponent
          styles={{
            margin: 10,
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity onPress={onClose}>
            <TextComponent
              text="Cancel"
              color={appColors.primary}
              styles={{
                fontSize: 16,
                fontWeight: 'bold',
                color: appColors.primary,
              }}
            />
          </TouchableOpacity>
          <SpaceComponent width={10} />
          <MaterialIcons
            name="cancel"
            size={30}
            color={appColors.primary}
            onPress={onClose}
          />
        </RowComponent>
        <View style={styles.repeatModalContent}>
          <RowComponent>
            <TextComponent
              text="Chọn lặp lại"
              color={appColors.black}
              styles={{
                fontSize: 16,
                fontWeight: 'bold',
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
                //ngay ket thuc se la ngay bat dau
                handleChangeValue('endDate', startDate);
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
          {/* them  Hang nam */}
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
                    taskDetail.repeat === 'year'
                      ? appColors.primary
                      : appColors.text,
                },
              ]}
              onPress={() => {
                handleChangeValue('repeat', 'year');
                setSelectedRepeat('Năm');
              }}>
              Hằng năm
            </Text>
          </View>
          <SpaceComponent height={20} />
          {taskDetail.repeat !== 'no' &&(
            <>
              <TouchableOpacity
                onPress={() => {
                  setVisibleEndDate(true);
                }}>
                <RowComponent>
                  <CalendarIcon size={24} color={appColors.primary} />
                  <TextComponent
                    text="Chọn ngày kết thúc:"
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
                  <TextComponent
                    text={
                      taskDetail.endDate
                        ? fomatDate(new Date(taskDetail.endDate))
                        : 'dd/MM/yyyy'
                    }
                    styles={{
                      fontSize: 16,
                      color: appColors.black,
                      textAlign: 'left',
                      paddingLeft: 16,
                    }}
                  />
                </RowComponent>
              </TouchableOpacity>
              <ModalizeDate
                visible={visibleEndDate}
                onClose={() => {
                  setVisibleEndDate(false);
                }}
                selectedDate={taskDetail.endDate}
                onDateChange={date => {
                  handleChangeValue('endDate', date);
                  const repeatCount = calculateRepeatCount(
                    date,
                    taskDetail.repeat,
                  );
                  handleChangeValue('repeatCount', repeatCount);
                }}
                taskDetail={taskDetail}
              />
            </>
          )}
          <SpaceComponent height={20} />
          {taskDetail.repeat === 'week' && (
            <View>
              <RowComponent>
                <Calendar1 size={24} color={appColors.primary} />
                <TextComponent
                  text="Chọn ngày trong tuần:"
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

                <TextComponent
                  text={
                    taskDetail.repeatDays
                      ?.map(
                        (day: number) =>
                          ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day],
                      )
                      .join(', ') || ''
                  }
                  styles={{
                    fontSize: 16,
                    color: appColors.black,
                    textAlign: 'left',
                    paddingLeft: 16,
                  }}
                />
              </RowComponent>
              <SpaceComponent height={10} />
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
            </View>
          )}
          {taskDetail.repeat === 'month' && (
            <View>
              <SectionComponent>
                <TextComponent text="Chọn ngày trong tháng" />
                <View style={styles.weekDaysContainer}>
                  {[...Array(31).keys()].map((day, index) => {
                    const actualDay = day + 1; // Tính giá trị ngày thực tế (từ 1 đến 31)
                    const isValidDay = actualDay >= startDay; // Kiểm tra xem ngày có hợp lệ không

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.weekDay,
                          taskDetail.repeatDays?.includes(actualDay) &&
                            styles.selectedDay,
                          !isValidDay && styles.disabledDay, // Vô hiệu hóa ngày trước ngày bắt đầu
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
    padding: 10,
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

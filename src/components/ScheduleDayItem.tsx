// components/ScheduleDayItem.tsx

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import {appColors} from '../constants';

interface ScheduleDayItemProps {
  item: WeekDayModel;
  selectedDay: string | null;
  onPress: (date: string) => void;
}

interface WeekDayModel {
  day: string;
  date: string;
  fullDate: Date;
  isSaturday: boolean;
  isSunday: boolean;
}

export const ScheduleDayItem: React.FC<ScheduleDayItemProps> = ({
  item,
  selectedDay,
  onPress,
}) => {
  const isToday = new Date().toDateString() === item.fullDate.toDateString();

  return (
    <TouchableOpacity
      style={[
        styles.dayButton,
        item.date === selectedDay && styles.selectedDayButton,
        (item.isSaturday || item.isSunday) && styles.weekendDayButton,
        isToday && styles.todayButton,
      ]}
      onPress={() => onPress(item.date)}>
      <View style={styles.dayContent}>
        <Text
          style={[
            styles.dayText,
            item.date === selectedDay && styles.selectedDayText,
            (item.isSaturday || item.isSunday) && styles.weekendDayText,
            isToday && styles.todayText,
          ]}>
          {item.day}
        </Text>
        <Text
          style={[
            styles.dateText,
            item.date === selectedDay && styles.selectedDateText,
            (item.isSaturday || item.isSunday) && styles.weekendDateText,
            isToday && styles.todayText,
          ]}>
          {item.fullDate.getDate()}
        </Text>
        {item.date === selectedDay && <View style={styles.selectedDot} />}
        {isToday && <View style={styles.todayDot} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 5,
    marginHorizontal: 2,
    borderRadius: 6,
    height: 70,
  },
  selectedDayButton: {
    backgroundColor: appColors.gray5,
  },
  weekendDayButton: {},
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  selectedDayText: {
    color: 'white',
  },
  selectedDateText: {
    color: 'white',
  },
  weekendDayText: {
    color: 'red',
  },
  weekendDateText: {
    color: 'red',
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    marginTop: 2,
  },
  todayButton: {},
  todayText: {
    color: appColors.primary,
    fontWeight: 'bold',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: appColors.primary,
    marginTop: 2,
  },
});

import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {isSameDay} from 'date-fns';

interface DayItemProps {
  day: {
    day: string;
    date: string;
    fullDate: Date;
    isSaturday: boolean;
    isSunday: boolean;
  };
  selectedDay: string | null;
  onSelectDay: (date: string | null) => void;
}

const DayItem: React.FC<DayItemProps> = ({day, selectedDay, onSelectDay}) => {
  const isToday = isSameDay(day.fullDate, new Date());
  return (
    <TouchableOpacity
      style={[
        styles.dayButton,
        day.date === selectedDay && styles.selectedDayButton,
        (day.isSaturday || day.isSunday) && styles.weekendDayButton,
        isToday && styles.todayButton,
      ]}
      onPress={() => onSelectDay(day.date === selectedDay ? null : day.date)}>
      <View style={styles.dayContent}>
        <Text
          style={[
            styles.dayText,
            day.date === selectedDay && styles.selectedDayText,
            (day.isSaturday || day.isSunday) && styles.weekendDayText,
            isToday && styles.todayText,
          ]}>
          {day.day}
        </Text>
        <Text
          style={[
            styles.dateText,
            day.date === selectedDay && styles.selectedDateText,
            (day.isSaturday || day.isSunday) && styles.weekendDateText,
            isToday && styles.todayText,
          ]}>
          {day.fullDate.getDate()}
        </Text>
        {day.date === selectedDay && <View style={styles.selectedDot} />}
        {isToday && <View style={styles.todayDot} />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dayButton: {
    padding: 8,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayButton: {
    backgroundColor: '#4caf50',
  },
  weekendDayButton: {
    backgroundColor: '#ffccbc',
  },
  todayButton: {
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  dayContent: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: 'white',
  },
  weekendDayText: {
    color: '#f57c00',
  },
  todayText: {
    color: '#2196f3',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  selectedDateText: {
    color: 'white',
  },
  weekendDateText: {
    color: '#f57c00',
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginTop: 4,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196f3',
    marginTop: 4,
  },
});

export default DayItem;

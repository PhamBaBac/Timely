import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {appInfo} from '../../constants';
import {DateTime} from '../../utils/DateTime';

const Teamwork = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const generateWeekDays = () => {
    const current = new Date();
    const weekDays = [];

    const monday = new Date(current);
    monday.setDate(
      current.getDate() - current.getDay() + (current.getDay() === 0 ? -6 : 1),
    );

    for (let i = 0; i < 7; i++) {
      const dateOffset = new Date(monday);
      dateOffset.setDate(monday.getDate() + i);

      const dayName = DateTime.GetWeekday(dateOffset.getTime());
      const dayDate = DateTime.GetDayOfWeek(dateOffset.getTime());

      weekDays.push({
        day: dayName,
        date: dayDate,
        isSaturday: dateOffset.getDay() === 6,
        isSunday: dateOffset.getDay() === 0,
      });
    }

    return weekDays;
  };

  const weekDays = generateWeekDays();

  const scheduleItems = [
    {
      date: 'Th 2, 23/09',
      items: [
        {
          title: 'Lesson 1',
          details: [
            {label: 'Period :', value: '7 - 9'},
            {label: 'Group :', value: '2'},
            {label: 'Room :', value: 'A'},
            {label: 'Instructor :', value: 'John Doe'},
          ],
        },
      ],
    },
    {
      date: 'Th 3, 24/09',
      items: [
        {
          title: 'Lesson 2',
          details: [
            {label: 'Period :', value: '1 - 3'},
            {label: 'Group :', value: '1'},
            {label: 'Room :', value: 'B'},
            {label: 'Instructor :', value: 'Jane Doe'},
          ],
        },
      ],
    },
  ];

  const filteredScheduleItems = selectedDay
    ? scheduleItems.filter(item => item.date.includes(selectedDay))
    : scheduleItems;

  const renderDayItem = ({
    item,
  }: {
    item: {day: string; date: string; isSaturday: boolean; isSunday: boolean};
  }) => (
    <TouchableOpacity
      style={[
        styles.dayButton,
        item.date === selectedDay && styles.selectedDayButton,
        (item.isSaturday || item.isSunday) && styles.weekendDayButton,
      ]}
      onPress={() =>
        setSelectedDay(item.date === selectedDay ? null : item.date)
      }>
      <View style={styles.dayContent}>
        <Text
          style={[
            styles.dayText,
            item.date === selectedDay && styles.selectedDayText,
            (item.isSaturday || item.isSunday) && styles.weekendDayText,
          ]}>
          {item.day}
        </Text>
        <Text
          style={[
            styles.dateText,
            item.date === selectedDay && styles.selectedDateText,
            (item.isSaturday || item.isSunday) && styles.weekendDateText,
          ]}>
          {item.date}
        </Text>
        {item.date === selectedDay && <View style={styles.selectedDot} />}
      </View>
    </TouchableOpacity>
  );

  const renderScheduleItem = ({
    item,
  }: {
    item: {
      date: string;
      items: {title: string; details: {label: string; value: string}[]}[];
    };
  }) => (
    <View style={styles.scheduleItem}>
      <Text style={styles.scheduleDate}>{item.date}</Text>
      {item.items.map((scheduleItem, itemIndex) => (
        <View key={itemIndex} style={styles.scheduleItemContent}>
          <Text style={styles.scheduleItemTitle}>{scheduleItem.title}</Text>
          {scheduleItem.details.map((detail, detailIndex) => (
            <View key={detailIndex} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{detail.label}</Text>
              <Text style={styles.detailValue}>{detail.value}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch học/ Lịch</Text>
      </View>

      <View style={styles.weekDaysWrapper}>
        <FlatList
          data={weekDays}
          renderItem={renderDayItem}
          keyExtractor={item => item.date}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekDaysContainer}
        />
      </View>

      <FlatList
        data={filteredScheduleItems}
        renderItem={renderScheduleItem}
        keyExtractor={item => item.date}
        style={styles.scheduleContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#8A2BE2', // Thay đổi từ '#1e88e5' (xanh) sang '#8e24aa' (tím)
    padding: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDaysWrapper: {
    height: 80,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  weekDaysContainer: {
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 6,
    height: 60,
  },
  selectedDayButton: {
    backgroundColor: '#8A2BE2',
  },
  weekendDayButton: {},
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  dateText: {
    fontSize: 16,
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
  scheduleContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scheduleItem: {
    marginBottom: 16,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A2BE2', // Thay đổi từ '#1e88e5' (xanh) sang '#8e24aa' (tím)
    marginBottom: 8,
  },
  scheduleItemContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8A2BE2', // Thay đổi từ '#4caf50' (xanh lá) sang '#8e24aa' (tím)
  },
  scheduleItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    flex: 1,
    color: '#8A2BE2',
  },
  detailValue: {
    flex: 2,
    fontWeight: '500',
  },
});

export default Teamwork;

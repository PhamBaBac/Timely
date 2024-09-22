import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';

const Teamwork = () => {
  const [selectedDay, setSelectedDay] = useState('23');

  const weekDays = [
    {day: 'Th 2', date: '23', isSelected: true},
    {day: 'Th 3', date: '24'},
    {day: 'Th 4', date: '25'},
    {day: 'Th 5', date: '26'},
    {day: 'Th 6', date: '27'},
    {day: 'Th 7', date: '28', isSaturday: true},
    {day: 'CN', date: '29', isSunday: true},
  ];

  const scheduleItems = [
    {
      date: 'Th 2, 23/09',
      items: [
        {
          title: 'aAAAAAg',
          details: [
            {label: 'Tiết :', value: '7 - 9'},
            {label: 'Nhóm :', value: '2'},
            {label: 'Phòng :', value: 'A'},
            {label: 'Giảng viên :', value: 'AAAAAAAAAAAAA'},
          ],
        },
      ],
    },
    {
      date: 'Th 3, 24/09',
      items: [
        {
          title: 'AAAAAAAAAAAAA',
          details: [
            {label: 'Tiết :', value: '1 - 3'},
            {label: 'Nhóm :', value: '1'},
            {label: 'Phòng :', value: 'A'},
            {label: 'Giảng viên :', value: 'AAAAAAAAAAAAA'},
          ],
        },
        {
          title: 'AAAAAAAAAAAAAAAAAAAAA',
          details: [
            {label: 'Tiết :', value: '7 - 9'},
            {label: 'Phòng :', value: 'A'},
            {label: 'Giảng viên :', value: 'AAAAAAAAAAAAA'},
          ],
        },
      ],
    },
  ];

  const renderDayItem = ({
    item,
  }: {
    item: {
      day: string;
      date: string;
      isSelected?: boolean;
      isSaturday?: boolean;
      isSunday?: boolean;
    };
  }) => (
    <TouchableOpacity
      style={[
        styles.dayButton,
        item.date === selectedDay && styles.selectedDayButton,
        (item.isSaturday || item.isSunday) && styles.weekendDayButton,
      ]}
      onPress={() => setSelectedDay(item.date)}>
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
      {item.items.map(
        (
          scheduleItem: {
            title: string;
            details: {label: string; value: string}[];
          },
          itemIndex,
        ) => (
          <View key={itemIndex} style={styles.scheduleItemContent}>
            <Text style={styles.scheduleItemTitle}>{scheduleItem.title}</Text>
            {scheduleItem.details.map(
              (detail: {label: string; value: string}, detailIndex: number) => (
                <View key={detailIndex} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                  <Text style={styles.detailValue}>{detail.value}</Text>
                </View>
              ),
            )}
          </View>
        ),
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch học/ lịch thi</Text>
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
        data={scheduleItems}
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
    backgroundColor: '#1e88e5',
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
    backgroundColor: '#1e88e5',
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
    color: '#1e88e5',
    marginBottom: 8,
  },
  scheduleItemContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
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
    color: '#757575',
  },
  detailValue: {
    flex: 2,
    fontWeight: '500',
  },
});

export default Teamwork;

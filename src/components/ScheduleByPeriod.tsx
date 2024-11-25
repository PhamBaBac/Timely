import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const TIME_PERIODS = {
  MORNING: {
    name: 'Buổi sáng',
    periods: ['1-3', '4-6'],
    color: '#E3F2FD', // Softer light blue
    headerColor: '#2196F3', // Vibrant blue
  },
  AFTERNOON: {
    name: 'Buổi chiều',
    periods: ['7-9', '10-12'],
    color: '#FFF3E0', // Soft peach
    headerColor: '#FF9800', // Warm orange
  },
  EVENING: {
    name: 'Buổi tối',
    periods: ['13-15'],
    color: '#F3E5F5', // Soft lavender
    headerColor: '#9C27B0', // Deep purple
  },
};

const getPeriodCategory = (period: string) => {
  if (['1-3', '4-6'].includes(period)) return 'MORNING';
  if (['7-9', '10-12'].includes(period)) return 'AFTERNOON';
  if (['13-15'].includes(period)) return 'EVENING';
  return null;
};

interface Schedule {
  id: string;
  period: string;
  course: string;
  startDate: Date;
  endDate: Date;
  group: string;
  room: string;
  instructor: string;
  isExam: boolean;
  day: Date;
}

interface ScheduleByPeriodProps {
  schedules: Schedule[];
  onSchedulePress: (schedule: Schedule) => void;
}

const ScheduleByPeriod = ({
  schedules,
  onSchedulePress,
}: ScheduleByPeriodProps) => {
  const groupedSchedules = React.useMemo(() => {
    const groups: {[key: string]: Schedule[]} = {
      MORNING: [],
      AFTERNOON: [],
      EVENING: [],
    };

    schedules.forEach(schedule => {
      const category = getPeriodCategory(schedule.period);
      if (category) {
        groups[category].push(schedule);
      }
    });

    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const periodA = parseInt(a.period.split('-')[0]);
        const periodB = parseInt(b.period.split('-')[0]);
        return periodA - periodB;
      });
    });

    return groups;
  }, [schedules]);

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, {flex: 2}]}>Thời gian</Text>
      <Text style={[styles.headerCell, {flex: 3}]}>Môn học</Text>
      <Text style={[styles.headerCell, {flex: 2}]}>Phòng</Text>
      <Text style={[styles.headerCell, {flex: 3}]}>Giảng viên</Text>
    </View>
  );

  const renderScheduleRow = (schedule: Schedule, periodKey: string) => {
    const periodInfo = TIME_PERIODS[getPeriodCategory(schedule.period)!];
    return (
      <TouchableOpacity
        key={schedule.id}
        style={[
          styles.tableRow,
          schedule.isExam && styles.examRow,
          {
            backgroundColor: periodInfo.color,
            borderLeftColor: periodInfo.headerColor,
            borderLeftWidth: 6,
          },
        ]}
        onPress={() => onSchedulePress(schedule)}>
        <Text style={[styles.cell, {flex: 2}]}>Tiết {schedule.period}</Text>
        <Text style={[styles.cell, {flex: 3}]}>
          {schedule.course}
          {schedule.isExam && ' (Thi)'}
        </Text>
        <Text style={[styles.cell, {flex: 2}]}>{schedule.room}</Text>
        <Text style={[styles.cell, {flex: 3}]}>{schedule.instructor}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {Object.entries(TIME_PERIODS).map(([key, period]) => (
        <View
          key={key}
          style={[
            styles.periodSection,
            {backgroundColor: period.color},
            styles.shadow,
          ]}>
          <View
            style={[
              styles.periodHeader,
              {backgroundColor: period.headerColor},
            ]}>
            <Text style={styles.periodTitle}>
              {period.name} (Tiết {period.periods.join(', ')})
            </Text>
          </View>

          <View style={styles.tableContainer}>
            {renderTableHeader()}
            {groupedSchedules[key].length > 0 ? (
              groupedSchedules[key].map(schedule =>
                renderScheduleRow(schedule, key),
              )
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có lịch học</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  periodSection: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  periodHeader: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  examRow: {
    borderWidth: 2,
    borderColor: '#FF5722',
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  cell: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    padding: 4,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ScheduleByPeriod;

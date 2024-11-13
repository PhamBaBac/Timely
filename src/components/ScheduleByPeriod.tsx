import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ScheduleItem} from './ScheduleItemProps ';

const TIME_PERIODS = {
  MORNING: {
    name: 'Buổi sáng',
    periods: ['1-3', '4-6'],
    color: '#E8F5E9', // Light green
  },
  AFTERNOON: {
    name: 'Buổi chiều',
    periods: ['7-9', '10-12'],
    color: '#FFF3E0', // Light orange
  },
  EVENING: {
    name: 'Buổi tối',
    periods: ['13-15'],
    color: '#E1BEE7', // Light purple
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

  const renderScheduleRow = (schedule: Schedule) => (
    <View
      key={schedule.id}
      style={[
        styles.tableRow,
        schedule.isExam && styles.examRow,
        {
          backgroundColor:
            TIME_PERIODS[getPeriodCategory(schedule.period)!].color,
        },
      ]}
      onTouchEnd={() => onSchedulePress(schedule)}>
      <Text style={[styles.cell, {flex: 2}]}>Tiết {schedule.period}</Text>
      <Text style={[styles.cell, {flex: 3}]}>
        {schedule.course}
        {schedule.isExam && ' (Thi)'}
      </Text>
      <Text style={[styles.cell, {flex: 2}]}>{schedule.room}</Text>
      <Text style={[styles.cell, {flex: 3}]}>{schedule.instructor}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {Object.entries(TIME_PERIODS).map(([key, period]) => (
        <View
          key={key}
          style={[styles.periodSection, {backgroundColor: period.color}]}>
          <View style={styles.periodHeader}>
            <Text style={styles.periodTitle}>
              {period.name} (Tiết {period.periods.join(', ')})
            </Text>
          </View>

          <View style={styles.tableContainer}>
            {renderTableHeader()}
            {groupedSchedules[key].length > 0 ? (
              groupedSchedules[key].map(schedule => renderScheduleRow(schedule))
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
  periodHeader: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
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
    padding: 8,
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

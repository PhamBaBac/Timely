import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {ScheduleItem} from './ScheduleItemProps ';

const TIME_PERIODS = {
  MORNING: {
    name: 'Buổi sáng',
    periods: ['1-3', '4-6'],
    color: '#E3F2FD',
  },
  AFTERNOON: {
    name: 'Buổi chiều',
    periods: ['7-9', '10-12'],
    color: '#FFF3E0',
  },
  EVENING: {
    name: 'Buổi tối',
    periods: ['13-15'],
    color: '#F3E5F5',
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      {Object.entries(TIME_PERIODS).map(([key, period]) => (
        <View
          key={key}
          style={[styles.periodSection, {backgroundColor: period.color}]}>
          <View style={styles.periodHeader}>
            <Text style={styles.periodTitle}>{period.name}</Text>
            <Text style={styles.periodTime}>
              {`(Tiết ${period.periods.join(', ')})`}
            </Text>
          </View>

          <ScrollView
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scheduleList}>
            {groupedSchedules[key].length > 0 ? (
              groupedSchedules[key].map((schedule, index) => (
                <View
                  key={`${schedule.id}-${index}`}
                  style={styles.scheduleItem}>
                  <ScheduleItem item={schedule} onPress={onSchedulePress} />
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có lịch học</Text>
              </View>
            )}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center', // Center content horizontally
  },
  periodSection: {
    marginVertical: 8,
    width: '92%', // Slightly smaller than screen width
    borderRadius: 12,
    padding: 12,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center header content
    marginBottom: 8,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  periodTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  scheduleList: {
    paddingVertical: 8,
    alignItems: 'center', // Center items vertically
    justifyContent: 'center', // Center items horizontally
    minWidth: '100%', // Ensure the ScrollView takes full width
  },
  scheduleItem: {
    width: 300,
    marginHorizontal: 6, // Equal spacing on both sides
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default ScheduleByPeriod;

import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {ScheduleItem} from './ScheduleItemProps '; // Fix the import statement

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
  day: Date; // Added missing property
}

interface ScheduleByPeriodProps {
  schedules: Schedule[];
  onSchedulePress: (schedule: Schedule) => void;
}

const ScheduleByPeriod = ({
  schedules,
  onSchedulePress,
}: ScheduleByPeriodProps) => {
  // Group schedules by time period
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

    // Sort within each group by period
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
    <ScrollView style={styles.container}>
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
            horizontal
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
              <Text style={styles.emptyText}>Không có lịch học</Text>
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
  periodSection: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  scheduleItem: {
    width: 300,
    marginRight: 12,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default ScheduleByPeriod;

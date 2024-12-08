import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {format} from 'date-fns';

export interface ScheduleModel {
  id: string;
  course: string;
  period: string;
  group: string;
  room: string;
  day: Date;
  instructor: string;
  isExam: boolean;
  startDate: Date;
  endDate: Date;
}

export interface WeekDayModel {
  day: string;
  date: string;
  fullDate: Date;
}

const PERIODS = ['Sáng (1-6)', 'Chiều (7-12)', 'Tối (13-15)'];
const {width, height} = Dimensions.get('window');

interface TimetableViewProps {
  schedules: ScheduleModel[];
  weekDays: WeekDayModel[];
  onSchedulePress?: (schedule: ScheduleModel) => void;
}

const TimetableView = ({
  schedules, 
  weekDays,
  onSchedulePress,
}: TimetableViewProps) => {
  const getColorForSchedule = (schedule: ScheduleModel) => {
    if (schedule.isExam) {
      return 'hsl(50, 100%, 85%)'; // Light yellow background for exams
    }
    return 'hsl(210, 70%, 85%)'; // Light blue background for classes
  };

  const getBorderColorForSchedule = (schedule: ScheduleModel) => {
    if (schedule.isExam) {
      return 'hsl(50, 90%, 50%)'; // Dark yellow border for exams
    }
    return 'hsl(210, 90%, 50%)'; // Dark blue border for classes
  };

  const prepareTableData = () => {
    const header = [
      'Buổi học',
      ...weekDays.map(day => `${day.day}\n${format(day.fullDate, 'dd/MM')}`),
    ];

    const body = PERIODS.map(period => {
      const periodRange = period.match(/\((\d+)-(\d+)\)/);
      const startPeriod = periodRange ? periodRange[1] : '';
      const endPeriod = periodRange ? periodRange[2] : '';

      return [
        period,
        ...weekDays.map(day => {
          const daySchedules = schedules.filter(
            schedule =>
              parseInt(schedule.period) >= parseInt(startPeriod) &&
              parseInt(schedule.period) <= parseInt(endPeriod) &&
              format(schedule.day, 'yyyy-MM-dd') === day.date,
          );

          const sortedSchedules = daySchedules.sort(
            (a, b) => parseInt(a.period) - parseInt(b.period),
          );

          const schedulesWithDetails = sortedSchedules.map(schedule => ({
            ...schedule,
            period: schedule.period,
            text: `${schedule.course}\n${
              schedule.group ? `Nhóm: ${schedule.group}\n` : ''
            }${schedule.isExam ? 'THI: ' : ''}Tiết ${schedule.period}${
              schedule.room ? `\nPhòng: ${schedule.room}` : ''
            }${schedule.instructor ? `\nGV: ${schedule.instructor}` : ''}`,
            color: getColorForSchedule(schedule),
          }));

          return {
            schedules: schedulesWithDetails,
            color:
              schedulesWithDetails.length > 0
                ? schedulesWithDetails[0].color
                : '#ffffff',
          };
        }),
      ];
    });

    return {header, body};
  };

  const renderScheduleDetails = (
    schedules: ScheduleModel[],
    onPress?: (schedule: ScheduleModel) => void,
  ) => {
    return schedules.map((schedule, index) => (
      <TouchableOpacity
        key={`schedule-${index}`}
        onPress={() => onPress && onPress(schedule)}
        style={[
          styles.scheduleContainer,
          {
            backgroundColor: getColorForSchedule(schedule),
            borderColor: getBorderColorForSchedule(schedule),
            borderWidth: 2,
          },
        ]}>
        <Text style={styles.cellText}>
          {`${schedule.course}\n${
            schedule.group ? `Nhóm: ${schedule.group}\n` : ''
          }${schedule.isExam ? 'THI: ' : ''}Tiết ${schedule.period}${
            schedule.room ? `\nPhòng: ${schedule.room}` : ''
          }${schedule.instructor ? `\nGV: ${schedule.instructor}` : ''}`}
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderRow = ({item}: {item: any[]}) => (
    <View style={styles.row}>
      {item.map((cell, index) => (
        <View
          key={`cell-${index}`}
          style={[
            styles.cell,
            index === 0 ? styles.periodCell : {},
            {backgroundColor: cell.color},
          ]}>
          {cell.schedules ? (
            renderScheduleDetails(cell.schedules, onSchedulePress)
          ) : (
            <Text style={styles.cellText}>{cell}</Text>
          )}
        </View>
      ))}
    </View>
  );

  const {header, body} = prepareTableData();

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <View>
          <View style={[styles.row, styles.headerRow]}>
            {header.map((cell, index) => (
              <View
                key={`header-${index}`}
                style={[
                  styles.cell,
                  styles.headerCell,
                  index === 0 ? styles.periodCell : {},
                ]}>
                <Text style={styles.headerText}>{cell}</Text>
              </View>
            ))}
          </View>
          <FlatList
            data={body}
            renderItem={renderRow}
            keyExtractor={(item, index) => `row-${index}`}
            showsVerticalScrollIndicator={true}
            style={styles.flatlistContainer}
            contentContainerStyle={styles.flatlistContent}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flatlistContainer: {
    maxHeight: height * 0.7,
  },
  flatlistContent: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  headerRow: {
    backgroundColor: '#3366cc',
  },
  headerCell: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cell: {
    width: width / 3,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  periodCell: {
    backgroundColor: '#3366cc',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'left',
  },
  cellText: {
    fontSize: 15,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  scheduleContainer: {
    width: '100%',
    padding: 5,
    marginVertical: 2,
    borderRadius: 5,
  },
});

export default TimetableView;

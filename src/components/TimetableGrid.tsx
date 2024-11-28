import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {ScheduleModel} from '../models/ScheduleModel';

const PERIODS = ['1-3', '4-6', '7-9', '10-12', '13-15'];
const CELL_WIDTH = Dimensions.get('window').width / 2.5;
const CELL_HEIGHT = 150;

interface TimetableGridProps {
  filteredScheduleItems: ScheduleModel[];
  handleSchedulePress: (schedule: ScheduleModel) => void;
  handleAddSchedule: (schedule: ScheduleModel) => void;
  defaultSchedule: ScheduleModel;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({
  filteredScheduleItems,
  handleSchedulePress,
  handleAddSchedule,
  defaultSchedule,
}) => {
  const renderTimetableGrid = () => {
    return (
      <ScrollView
        horizontal
        contentContainerStyle={styles.timetableScrollContainer}
        showsHorizontalScrollIndicator={false}>
        <View style={styles.timetableContainer}>
          <View style={styles.timetableHeader}>
            {[
              '',
              'Thứ Hai',
              'Thứ Ba',
              'Thứ Tư',
              'Thứ Năm',
              'Thứ Sáu',
              'Thứ Bảy',
              'Chủ Nhật',
            ].map((day, index) => (
              <Text
                key={day}
                style={[
                  styles.timetableHeaderText,
                  index === 0 && {width: 50},
                ]}>
                {day}
              </Text>
            ))}
          </View>
          <ScrollView>
            {PERIODS.map(period => (
              <View key={period} style={styles.periodRow}>
                <Text style={styles.periodText}>{period}</Text>
                {[
                  'Thứ Hai',
                  'Thứ Ba',
                  'Thứ Tư',
                  'Thứ Năm',
                  'Thứ Sáu',
                  'Thứ Bảy',
                  'Chủ Nhật',
                ].map(day => {
                  const schedulesInCell = filteredScheduleItems.filter(
                    schedule => {
                      const scheduleDay = schedule.day.getDay();
                      const dayMap = {
                        'Thứ Hai': 1,
                        'Thứ Ba': 2,
                        'Thứ Tư': 3,
                        'Thứ Năm': 4,
                        'Thứ Sáu': 5,
                        'Thứ Bảy': 6,
                        'Chủ Nhật': 0,
                      };
                      return (
                        schedule.period === period &&
                        scheduleDay === dayMap[day as keyof typeof dayMap]
                      );
                    },
                  );

                  return (
                    <TouchableOpacity
                      key={`${period}-${day}`}
                      style={[
                        styles.timetableCell,
                        {
                          minHeight: CELL_HEIGHT,
                          height: CELL_HEIGHT,
                          width: CELL_WIDTH,
                          backgroundColor: schedulesInCell.some(s => s.isExam)
                            ? '#FFF3E0'
                            : 'white',
                        },
                      ]}
                      onPress={() => {
                        const matchingSchedule =
                          schedulesInCell.length > 0
                            ? schedulesInCell[0]
                            : null;

                        if (matchingSchedule) {
                          handleSchedulePress(matchingSchedule);
                        } else {
                          handleAddSchedule({
                            ...defaultSchedule,
                            period: period,
                            day: new Date(),
                          });
                        }
                      }}>
                      {schedulesInCell.map(schedule => (
                        <View
                          key={schedule.id}
                          style={[
                            styles.scheduleInCell,
                            schedule.isExam && styles.examSchedule,
                          ]}>
                          <Text
                            style={[
                              styles.scheduleCellText,
                              schedule.isExam && styles.examScheduleText,
                            ]}
                            numberOfLines={1}>
                            {schedule.course}
                          </Text>
                          <Text
                            style={styles.scheduleCellSubtext}
                            numberOfLines={1}>
                            Phòng: {schedule.room}
                          </Text>
                          <Text
                            style={styles.scheduleCellSubtext}
                            numberOfLines={1}>
                            Nhóm: {schedule.group}
                          </Text>
                          <Text
                            style={styles.scheduleCellSubtext}
                            numberOfLines={1}>
                            GV: {schedule.instructor}
                          </Text>
                          {schedule.fullDateDisplay && (
                            <Text style={styles.dateSubtext} numberOfLines={1}>
                              {schedule.fullDateDisplay}
                            </Text>
                          )}
                          {schedule.isExam && (
                            <Text
                              style={[
                                styles.scheduleCellSubtext,
                                styles.examBadge,
                              ]}
                              numberOfLines={1}>
                              Thi
                            </Text>
                          )}
                        </View>
                      ))}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  return renderTimetableGrid();
};

const styles = StyleSheet.create({
  // ... (copy the existing styles from the original component)
  // Make sure to copy the entire styles object from the original Teamwork component
  timetableScrollContainer: {
    flexGrow: 1,
  },
  timetableContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  timetableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f4f8',
    paddingVertical: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  timetableHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 14,
  },
  periodRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  periodText: {
    width: 60,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#34495e',
    padding: 10,
    fontSize: 12,
  },
  timetableCell: {
    flex: 1,
    minWidth: 140,
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#e8eaed',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scheduleInCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f0f4f8',
  },
  scheduleCellText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  scheduleCellSubtext: {
    fontSize: 11,
    color: '#34495e',
    textAlign: 'center',
    marginVertical: 2,
  },
  examSchedule: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  examScheduleText: {
    color: '#D84315',
  },
  examBadge: {
    backgroundColor: '#FFE0B2',
    color: '#BF360C',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    fontWeight: 'bold',
    fontSize: 10,
    alignSelf: 'center',
  },
  dateSubtext: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default TimetableGrid;

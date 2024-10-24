// components/ScheduleItem.tsx

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {ScheduleModel} from '../models/ScheduleModel';
import {DateTime} from '../utils/DateTime';
import {appColors} from '../constants';

interface ScheduleItemProps {
  item: ScheduleModel;
  onPress: (schedule: ScheduleModel) => void;
}

export const ScheduleItem: React.FC<ScheduleItemProps> = ({item, onPress}) => {
  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.scheduleItem}>
      <Text style={styles.scheduleDate}>
        {`${DateTime.GetWeekday(
          item.startDate.getTime(),
        )}- ${item.startDate.toLocaleDateString('en-GB')}`}
      </Text>
      <View
        style={[styles.scheduleItemContent, item.isExam && styles.examItem]}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleItemTitle}>{item.course}</Text>
        </View>
        <View style={styles.scheduleDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tiết:</Text>
            <Text style={styles.detailValue}>{item.period}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nhóm:</Text>
            <Text style={styles.detailValue}>{item.group}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phòng:</Text>
            <Text style={styles.detailValue}>{item.room}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giảng viên:</Text>
            <Text style={styles.detailValue}>{item.instructor}</Text>
          </View>
        </View>
        {item.isExam && (
          <View style={styles.scheduleFooter}>
            <Text style={styles.scheduleFooterText}>Thi</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  scheduleItem: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  scheduleItemContent: {
    flexDirection: 'column',
  },
  examItem: {
    borderLeftWidth: 4,
    borderLeftColor: 'red',
  },
  scheduleHeader: {
    backgroundColor: appColors.primary,
    padding: 10,
  },
  scheduleItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  scheduleDetails: {
    padding: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    color: appColors.primary,
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
  scheduleFooter: {
    backgroundColor: 'red',
    padding: 5,
    alignItems: 'center',
  },
  scheduleFooterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.primary,
    marginBottom: 8,
  },
});

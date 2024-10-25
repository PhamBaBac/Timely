import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {ScheduleModel} from '../models/ScheduleModel';
import {DateTime} from '../utils/DateTime';
import {appColors} from '../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ScheduleItemProps {
  item: ScheduleModel;
  onPress: (schedule: ScheduleModel) => void;
}

// sắp xếp theo period và startDate
// const compareSchedule = (a: ScheduleModel, b: ScheduleModel) => {
//   // Lấy số đầu tiên của period range
//   const periodA = Number(a.period.split('-')[0]); // Ví dụ "1-3" -> 1
//   const periodB = Number(b.period.split('-')[0]); // Ví dụ "4-6" -> 4

//   if (periodA === periodB) {
//     return a.startDate.getTime() - b.startDate.getTime();
//   }
//   return periodA - periodB;
// };

export const ScheduleItem: React.FC<ScheduleItemProps> = ({item, onPress}) => {
  const formattedDate = `${DateTime.GetWeekday(
    item.startDate.getTime(),
  )} - ${item.startDate.toLocaleDateString('en-GB')}`;

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={[styles.scheduleItem, item.isExam && styles.examItem]}
      activeOpacity={0.7}>
      <View style={styles.dateContainer}>
        <Icon name="calendar" size={20} color={appColors.primary} />
        <Text style={styles.scheduleDate}>{formattedDate}</Text>
      </View>

      <View style={styles.scheduleItemContent}>
        <View style={styles.scheduleHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.scheduleItemTitle} numberOfLines={2}>
              {item.course}
            </Text>
            {item.isExam && (
              <View style={styles.examBadge}>
                <Text style={styles.examBadgeText}>THI</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.scheduleDetails}>
          <DetailRow icon="clock-outline" label="Tiết" value={item.period} />
          <DetailRow icon="account-group" label="Nhóm" value={item.group} />
          <DetailRow icon="door" label="Phòng" value={item.room} />
          <DetailRow
            icon="account"
            label="Giảng viên"
            value={item.instructor}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.detailRow}>
    <View style={styles.labelContainer}>
      <Icon
        name={icon}
        size={18}
        color={appColors.primary}
        style={styles.icon}
      />
      <Text style={styles.detailLabel}>{label}:</Text>
    </View>
    <Text style={styles.detailValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  scheduleItem: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  examItem: {
    borderLeftWidth: 4,
    borderLeftColor: appColors.danger || 'red',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  scheduleDate: {
    fontSize: 15,
    fontWeight: '600',
    color: appColors.primary,
    marginLeft: 8,
  },
  scheduleItemContent: {
    flexDirection: 'column',
  },
  scheduleHeader: {
    backgroundColor: appColors.primary,
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    marginRight: 8,
  },
  examBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  examBadgeText: {
    color: appColors.danger || 'red',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduleDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: width * 0.3,
  },
  icon: {
    marginRight: 8,
  },
  detailLabel: {
    color: appColors.text2 || '#666',
    fontSize: 14,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    color: appColors.text || '#333',
    fontSize: 14,
    fontWeight: '500',
  },
});

// components/ScheduleHeader.tsx

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../constants';

interface ScheduleHeaderProps {
  onTodayPress: () => void;
  onAddPress: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  onTodayPress,
  onAddPress,
}) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Lịch học/ Lịch thi</Text>
      <View style={styles.headerButtons}>
        <TouchableOpacity onPress={onTodayPress} style={styles.todayButton}>
          <MaterialIcons name="today" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAddPress} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: appColors.primary,
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  todayButton: {
    padding: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: appColors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

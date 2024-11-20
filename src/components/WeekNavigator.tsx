import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../constants';

interface WeekNavigatorProps {
  weekDays: {fullDate: Date}[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  weekDays,
  onPrevWeek,
  onNextWeek,
}) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onPrevWeek} style={styles.navButton}>
      <MaterialIcons name="chevron-left" size={24} color="#8A2BE2" />
    </TouchableOpacity>
    <Text style={styles.weekLabel}>
      {`${weekDays[0].fullDate.toLocaleDateString(
        'vi-VN',
      )} - ${weekDays[6].fullDate.toLocaleDateString('vi-VN')}`}
    </Text>
    <TouchableOpacity onPress={onNextWeek} style={styles.navButton}>
      <MaterialIcons name="chevron-right" size={24} color="#8A2BE2" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
  },
  navButton: {
    padding: 8,
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.primary,
  },
});

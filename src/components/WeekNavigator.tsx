// components/WeekNavigator.tsx

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../constants';

interface WeekNavigatorProps {
  weekDays: WeekDayModel[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

interface WeekDayModel {
  day: string;
  date: string;
  fullDate: Date;
  isSaturday: boolean;
  isSunday: boolean;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  weekDays,
  onPrevWeek,
  onNextWeek,
}) => {
  return (
    <View style={styles.weekNavigation}>
      <TouchableOpacity onPress={onPrevWeek} style={styles.navButton}>
        <MaterialIcons name="chevron-left" size={24} color="#8A2BE2" />
      </TouchableOpacity>
      <Text style={styles.weekLabel}>
        {`${weekDays[0].fullDate.toLocaleDateString()} - ${weekDays[6].fullDate.toLocaleDateString()}`}
      </Text>
      <TouchableOpacity onPress={onNextWeek} style={styles.navButton}>
        <MaterialIcons name="chevron-right" size={24} color="#8A2BE2" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
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

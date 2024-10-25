import React from 'react';
import {View, FlatList} from 'react-native';
import {ScheduleItem} from './ScheduleItemProps ';
import {ScheduleModel} from '../models/ScheduleModel';
import {compareSchedule} from '../utils/compareSchedule';

interface ScheduleListProps {
  schedules: ScheduleModel[];
  onPressItem: (schedule: ScheduleModel) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  onPressItem,
}) => {
  // Sắp xếp danh sách schedules
  const sortedSchedules = [...schedules].sort(compareSchedule);

  return (
    <FlatList
      data={sortedSchedules}
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => (
        <ScheduleItem item={item} onPress={onPressItem} />
      )}
    />
  );
};

export default ScheduleList;

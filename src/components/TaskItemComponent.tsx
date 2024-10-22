import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {appColors} from '../constants/appColor';
import {RowComponent} from '../components';
import {DateTime} from '../utils/DateTime';
import {addDays, addMonths, addWeeks, format} from 'date-fns';
import {TaskModel} from '../models/taskModel';

type TaskItemProps = {
  item: {
    id: string;
    description: string;
    startDate?: string;
    startTime?: string;
    isCompleted: boolean;
    isImportant: boolean;
    repeat: string;
  };
  onToggleComplete: (id: string) => void;
  onHighlight: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateRepeat: (id: string) => void;
  onPress: (item: any) => void;
};

const TaskItemComponent = ({
  item,
  onToggleComplete,
  onHighlight,
  onDelete,
  onUpdateRepeat,
  onPress,
}: TaskItemProps) => {
  const renderRightActions = () => (
    <View style={styles.swipeActions}>
      <Pressable
        style={styles.swipeActionButton}
        onPress={() => onDelete(item.id)}>
        <MaterialIcons name="delete" size={24} color={appColors.red} />
        <Text style={styles.actionText}>Xóa</Text>
      </Pressable>
      {item.repeat !== 'no' && (
        <Pressable
          style={styles.swipeActionButton}
          onPress={() => onUpdateRepeat(item.id)}>
          <MaterialIcons name="repeat" size={24} color={appColors.blue} />
          <Text style={styles.actionText}>Bỏ lặp lại</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Pressable onPress={() => onPress(item)}>
        <View style={styles.taskItem}>
          <Pressable
            style={styles.roundButton}
            onPress={() => onToggleComplete(item.id)}>
            {item.isCompleted ? (
              <MaterialIcons
                name="check-circle"
                size={24}
                color={appColors.primary}
              />
            ) : (
              <MaterialIcons
                name="radio-button-unchecked"
                size={24}
                color={appColors.gray}
              />
            )}
          </Pressable>
          <RowComponent>
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskTitle,
                  item.isCompleted && styles.completedTaskTitle,
                ]}>
                {item.description}
              </Text>
              <Text style={styles.taskDate}>
                {DateTime.GetDate(new Date(item.startDate || ''))} -
                {item.startTime
                  ? DateTime.formatTime(item.startTime)
                  : 'No start time'}
              </Text>
            </View>
            <Pressable
              style={{paddingRight: 40}}
              onPress={() => onHighlight(item.id)}>
              <MaterialIcons
                name="star"
                size={24}
                color={item.isImportant ? appColors.yellow : appColors.gray}
              />
            </Pressable>
          </RowComponent>
        </View>
      </Pressable>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: appColors.white,
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: appColors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  roundButton: {
    marginRight: 10,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'column',
  },
  taskTitle: {
    fontSize: 16,
    color: appColors.black,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: appColors.gray,
  },
  taskDate: {
    fontSize: 14,
    color: appColors.red,
    marginTop: 4,
  },
  swipeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  swipeActionButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: appColors.black,
    fontSize: 14,
    marginTop: 4,
  },
});

export default TaskItemComponent;

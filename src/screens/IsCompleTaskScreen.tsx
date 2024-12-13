import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import React from 'react';
import useCustomStatusBar from '../hooks/useCustomStatusBar';
import {appColors} from '../constants';
import {
  Container,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
  TitleComponent,
} from '../components';
import {TaskModel} from '../models/taskModel';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {format} from 'date-fns';
import { Star1, StarSlash } from 'iconsax-react-native';

const IsCompleTaskScreen = ({route, navigation}: any) => {
  useCustomStatusBar('dark-content', appColors.lightPurple);
  const {tasks}: {tasks: TaskModel[]} = route.params;
    const completedOnTime = tasks.filter(task => {
      const startDate = task.startDate ? new Date(task.startDate) : null;
      const startTime = task.startTime ? new Date(task.startTime) : null;
      const completedAt = task.updatedAt ? new Date(task.updatedAt) : null;

      if (task.isCompleted && completedAt) {
        // Kiểm tra nếu completedAt trước ngày startDate
        if (startDate && completedAt.getDate() < startDate.getDate()) {
          return true;
        }
        // Kiểm tra nếu completedAt cùng ngày startDate và trước thời gian startTime
        if (startDate && completedAt.getDate() === startDate.getDate()) {
          if (startTime && completedAt.getTime() < startTime.getTime()) {
            return true;
          }
        }
      }
      return false;
    })
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM');
  };
  const fomatDate1 = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  const renderTask = (item: TaskModel) => (
    <SectionComponent key={item.id}>
      <Pressable  onPress={() => {
          navigation.navigate('TaskDetailsScreen', {id: item.id});
        }}>
        <View style={styles.taskItem}>
          <Pressable style={styles.roundButton}>
            <MaterialIcons
              name="check-circle"
              size={24}
              color={appColors.gray}
            />
          </Pressable>
          <RowComponent>
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskTitle,
                  item.isCompleted && styles.completedTaskTitle,
                ]}>
                {item.title ? item.title : item.description}
              </Text>
              <Text style={styles.taskDate}>
                {item.dueDate
                  ? fomatDate(new Date(item.startDate || ''))
                  : 'No due date'}{' '}
                -{' '}
                {item.startTime ? formatTime(item.startTime) : 'No start time'}
              </Text>
            </View>
            <Pressable
              style={{
                paddingRight: 40,
              }}>
              {item.isImportant ? (
                <Star1 size={24} color={appColors.gray} />
              ) : (
                <StarSlash size={24} color={appColors.gray} />
              )}
            </Pressable>
          </RowComponent>
        </View>
      </Pressable>
    </SectionComponent>
  );

  return (
    <Container back isScroll title="CV hoàn thành đúng hạn">
      <ScrollView>
        {Object.entries(
          completedOnTime
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            )
            .reduce((acc, task) => {
              const date = fomatDate1(new Date(task.updatedAt));
              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push(task);
              return acc;
            }, {} as Record<string, TaskModel[]>),
        ).map(([date, tasks]) => (
          <SectionComponent key={date}>
            <TitleComponent text={date} color={appColors.primary} />
            <SpaceComponent height={8} />
            {tasks.map(task => renderTask(task))}
          </SectionComponent>
        ))}
      </ScrollView>
    </Container>
  );
};

export default IsCompleTaskScreen;
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
    borderLeftWidth: 2,
    borderLeftColor: appColors.gray,
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

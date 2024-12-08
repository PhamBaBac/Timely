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
import {Star1, StarSlash} from 'iconsax-react-native';

const StartTaskScreen = ({route, navigation}: any) => {
  useCustomStatusBar('dark-content', appColors.lightPurple);
  const {tasks}: {tasks: TaskModel[]} = route.params;
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  const fomatDate1 = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  const renderTask = (item: TaskModel) => (
    <SectionComponent key={item.id}>
      <Pressable
        onPress={() => {
          navigation.navigate('TaskDetailsScreen', {id: item.id});
        }}>
        <View
          style={[
            styles.taskItem,
            {
              borderLeftWidth: 2,
              borderLeftColor: item.isCompleted
                ? appColors.gray
                : appColors.primary,
            },
          ]}>
          <Pressable style={styles.roundButton}>
            {item.isCompleted ? (
              <MaterialIcons
                name="check-circle"
                size={24}
                color={appColors.gray}
              />
            ) : (
              <MaterialIcons
                name="radio-button-unchecked"
                size={24}
                color={appColors.primary}
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
                {item.title ? item.title : item.description}
              </Text>
              <Text style={styles.taskDate}>
                {item.startTime ? formatTime(item.startTime) : 'No start time'}
              </Text>
            </View>
            <Pressable
              style={{
                paddingRight: 40,
              }}>
              {item.isImportant ? (
                <Star1 size={24} color="#FF8A65" />
              ) : (
                <StarSlash size={24} color="#FF8A65" />
              )}
            </Pressable>
          </RowComponent>
        </View>
      </Pressable>
    </SectionComponent>
  );

  return (
    <Container back isScroll title="Công việc quan trọng">
      <ScrollView>
        {Object.entries(
          tasks
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            )
            .reduce((acc, task) => {
              const date = fomatDate1(new Date(task.startDate || ''));
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

export default StartTaskScreen;
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

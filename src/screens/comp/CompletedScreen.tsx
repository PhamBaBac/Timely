import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ScrollView} from 'react-native';
import {format, parseISO, isValid} from 'date-fns';
import {appColors} from '../../constants/appColor';
import {TaskModel} from '../../models/taskModel';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RowComponent} from '../../components';
import {useDispatch} from 'react-redux';
import {
  handleDeleteTask,
  handleToggleComplete,
  handleToggleImportant,
  handleUpdateRepeat,
} from '../../utils/taskUtil';

const CompletedScreen = ({navigation}: {navigation: any}) => {
  const user = auth().currentUser;
  const [completedTasks, setCompletedTasks] = useState<TaskModel[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .where('isCompleted', '==', true)
      .onSnapshot(snapshot => {
        const tasksList = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as TaskModel[];
        setCompletedTasks(tasksList);
      });

    return () => unsubscribe();
  }, [user]);

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM');
  };

  const handleDelete = (taskId: string) => {
    handleDeleteTask(taskId, dispatch, []);
  };

  const handleToggleCompleteTask = (taskId: string) => {
    handleToggleComplete(taskId, completedTasks, dispatch);
  };

  const handleHighlight = (taskId: string) => {
    handleToggleImportant(taskId, completedTasks, dispatch);
  };

  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('TaskDetailsScreen', {id: task.id});
  };

  const renderTask = (item: TaskModel) => {
    if (!item) return null;

    const renderRightActions = (item: TaskModel) => (
      <View style={styles.swipeActions}>
        <Pressable
          style={styles.swipeActionButton}
          onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete" size={24} color={appColors.red} />
          <Text style={styles.actionText}>Xóa</Text>
        </Pressable>

        {item.repeat !== 'no' && (
          <Pressable
            style={styles.swipeActionButton}
            onPress={() => handleUpdateRepeat(item.id)}>
            <MaterialIcons name="repeat" size={24} color={appColors.blue} />
            <Text style={styles.actionText}>Bỏ lặp lại</Text>
          </Pressable>
        )}
      </View>
    );

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        key={item.id}>
        <Pressable onPress={() => handleTaskPress(item)}>
          <View style={styles.taskItem}>
            <Pressable
              style={styles.roundButton}
              onPress={() => handleToggleCompleteTask(item.id)}>
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
                  {item.title ? item.title : item.description}
                </Text>
                <Text style={styles.taskDate}>
                  {item.dueDate
                    ? formatDate(new Date(item.startDate || ''))
                    : 'No due date'}{' '}
                  -{' '}
                  {item.startTime
                    ? formatTime(new Date(item.startTime))
                    : 'No start time'}
                </Text>
              </View>
              <Pressable
                style={{
                  paddingRight: 40,
                }}
                onPress={() => handleHighlight(item.id)}>
                <MaterialIcons
                  name="star"
                  size={24}
                  color={item.isImportant ? appColors.yellow : appColors.gray2}
                />
              </Pressable>
            </RowComponent>
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="assignment-turned-in"
        size={80}
        color={appColors.gray2}
      />
      <Text style={styles.emptyText}>Không có công việc nào đã hoàn thành</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.title}>Công việc đã hoàn thành</Text>
      </View>

      <ScrollView style={styles.tasksContainer}>
        {completedTasks.length > 0
          ? completedTasks.map(task => renderTask(task))
          : renderEmptyState()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.whitesmoke,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: appColors.black,
  },
  tasksContainer: {
    flex: 1,
  },
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
    borderLeftColor: appColors.primary,
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
    color: appColors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '50%',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: appColors.gray,
    marginTop: 16,
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

export default CompletedScreen;

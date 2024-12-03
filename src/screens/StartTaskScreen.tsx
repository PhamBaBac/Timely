import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import auth, {firebase} from '@react-native-firebase/auth';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {TaskModel} from '../models/taskModel';
import firestore from '@react-native-firebase/firestore';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {RowComponent} from '../components';
import {appColors} from '../constants/appColor';
import {format} from 'date-fns';
import {useDispatch, useSelector} from 'react-redux';
import { fetchTasks } from '../utils/taskUtil';

interface Props {
  navigation: any;
}

const StartTaskScreen: React.FC<Props> = ({navigation}) => {
   const user = auth().currentUser;
   const [tasks, setTasks] = useState<TaskModel[]>([]);
    useEffect(() => {
      if (user?.uid) {
        const unsubscribe = fetchTasks(user.uid, setTasks);

        // Cleanup on unmount
        return () => unsubscribe();
      }
    }, [user?.uid]);

  const formatTime = (date?: Date | string) => {
    if (!date) return 'No start time';
    return format(new Date(date), 'HH:mm');
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'No due date';
    return format(new Date(date), 'dd/MM');
  };

  const renderRightActions = (task: TaskModel) => (
    <View style={styles.swipeActions}>
      <Pressable
        style={styles.swipeActionButton}
        >
        <MaterialIcons name="delete" size={24} color={appColors.red} />
        <Text style={styles.actionText}>Xóa</Text>
      </Pressable>

      {task.repeat !== 'no' && (
        <Pressable
          style={styles.swipeActionButton}
          >
          <MaterialIcons name="repeat" size={24} color={appColors.blue} />
          <Text style={styles.actionText}>Bỏ lặp lại</Text>
        </Pressable>
      )}
    </View>
  );

  const renderTask = (task: TaskModel) => {
    if (!task) return null;

    return (
      <Swipeable renderRightActions={() => renderRightActions(task)}>
        <Pressable
          onPress={() =>
            navigation.navigate('TaskDetailsScreen', {id: task.id})
          }>
          <View style={styles.taskItem}>
            <Pressable
              style={styles.roundButton}
             >
              <MaterialIcons
                name={
                  task.isCompleted ? 'check-circle' : 'radio-button-unchecked'
                }
                size={24}
                color={task.isCompleted ? appColors.primary : appColors.gray}
              />
            </Pressable>
            <RowComponent>
              <View style={styles.taskContent}>
                <Text
                  style={[
                    styles.taskTitle,
                    task.isCompleted && styles.completedTaskTitle,
                  ]}>
                  {task.title || task.description}
                </Text>
                <Text style={styles.taskDate}>
                  {formatDate(task.startDate)} - {formatTime(task.startTime)}
                </Text>
              </View>
              <Pressable
                style={styles.starButton}
                onPress={() =>{}}>
                <MaterialIcons
                  name="star"
                  size={24}
                  color={task.isImportant ? appColors.yellow : appColors.gray2}
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
      <MaterialIcons name="star-outline" size={80} color={appColors.gray2} />
      <Text style={styles.emptyMessage}>
        Không có nhiệm vụ nào được đánh dấu sao
      </Text>
    </View>
  );

  const importantTasks = tasks.filter(task => task.isImportant);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhiệm vụ quan trọng</Text>
      </View>
      {importantTasks.length > 0 ? (
        <FlatList
          data={importantTasks}
          renderItem={({item}) => renderTask(item)}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: appColors.whitesmoke,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
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
  starButton: {
    paddingRight: 16,
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
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '50%',
  },
  emptyMessage: {
    fontSize: 16,
    color: appColors.gray,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default StartTaskScreen;

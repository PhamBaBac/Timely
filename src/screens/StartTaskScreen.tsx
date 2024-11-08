import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {TaskModel} from '../models/taskModel';
import firestore from '@react-native-firebase/firestore';

const StartTaskScreen = ({navigation}: {navigation: any}) => {
  const [tasks, setTasks] = useState<TaskModel[]>([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .onSnapshot(
        snapshot => {
          const taskList: TaskModel[] = [];
          snapshot.forEach(doc => {
            const task = doc.data() as TaskModel;
            taskList.push({...task, id: doc.id});
          });
          console.log('Fetched tasks:', taskList); // Thêm console log để kiểm tra dữ liệu
          setTasks(taskList);
        },
        error => {
          console.error('Error fetching tasks: ', error);
        },
      );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const renderTaskItem = ({item}: {item: TaskModel}) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetailScreen', {task: item})}>
      <MaterialIcons
        name="star"
        size={24}
        color={item.isImportant ? '#FFD700' : '#ccc'}
      />
      <View style={styles.taskContent}>
        {/* <Text style={styles.taskTitle}>{item.title}</Text> */}
        <Text style={styles.taskDescription}>{item.description}</Text>
        <Text style={styles.taskDate}>
          {item.dueDate
            ? new Date(item.dueDate).toLocaleDateString()
            : 'No due date'}
        </Text>
        {item.isCompleted && (
          <View style={styles.completedLabel}>
            <Text style={styles.completedLabelText}>Hoàn thành</Text>
          </View>
        )}
      </View>
      <MaterialIcons
        name={item.isCompleted ? 'check-circle' : 'radio-button-unchecked'}
        size={24}
        color={item.isCompleted ? '#4CAF50' : '#ccc'}
      />
    </TouchableOpacity>
  );

  const importantTasks = tasks.filter(task => task.isImportant);
  console.log('Important tasks:', importantTasks); // Thêm console log để kiểm tra nhiệm vụ nổi bật

  return (
    <View style={styles.container}>
      {/* Custom Header */}
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
          renderItem={renderTaskItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.emptyMessage}>
          Không có nhiệm vụ nào được đánh dấu sao.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskContent: {
    marginLeft: 16,
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  taskDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  taskDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  completedLabel: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  completedLabelText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default StartTaskScreen;

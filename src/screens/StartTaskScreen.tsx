import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {TaskModel} from '../models/taskModel';
import firestore from '@react-native-firebase/firestore';

const StartTaskScreen = ({navigation}: any) => {
  const [tasks, setTasks] = useState<TaskModel[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const taskList: TaskModel[] = [];
        const snapshot = await firestore().collection('tasks').get();
        snapshot.forEach(doc => {
          const task = doc.data() as TaskModel;
          taskList.push({...task, id: doc.id});
        });
        setTasks(taskList);
      } catch (error) {
        console.error('Error fetching tasks: ', error);
      }
    };

    fetchTasks();
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
        <Text style={styles.taskDescription}>{item.description}</Text>
        <Text style={styles.taskDate}>
          {item.dueDate
            ? new Date(item.createdAt).toLocaleDateString()
            : 'No due date'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const importantTasks = tasks.filter(task => task.isImportant);

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
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskContent: {
    marginLeft: 16,
  },
  taskDescription: {
    fontSize: 16,
  },
  taskDate: {
    fontSize: 14,
    color: '#888',
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

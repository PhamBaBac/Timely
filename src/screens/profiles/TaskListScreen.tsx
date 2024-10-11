import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {TaskModel} from '../../models/taskModel';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const TaskListScreen = ({route, navigation}: {route: any; navigation: any}) => {
  const {isCompleted, category} = route.params;
  const user = auth().currentUser;
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<TaskModel[]>([]);

  useEffect(() => {
    let query = firestore().collection('tasks').where('uid', '==', user?.uid);

    if (isCompleted !== undefined) {
      query = query.where('isCompleted', '==', isCompleted);
    }

    if (category) {
      if (category === 'Chưa phân loại') {
        query = query.where('category', '==', '');
      } else {
        query = query.where('category', '==', category);
      }
    }

    const unsubscribe = query.onSnapshot(snapshot => {
      const tasksList = snapshot.docs.map(doc => doc.data() as TaskModel);
      setTasks(tasksList);
      setFilteredTasks(tasksList);
    });

    return () => unsubscribe();
  }, [user, isCompleted, category]);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(task =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, tasks]);

  const renderItem = ({item}: {item: TaskModel}) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskName}>{item.name}</Text>
      <Text style={styles.taskDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isCompleted !== undefined
            ? isCompleted
              ? 'Nhiệm vụ đã hoàn thành'
              : 'Nhiệm vụ chưa hoàn thành'
            : category}
        </Text>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm nhiệm vụ..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredTasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có nhiệm vụ nào</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  taskItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TaskListScreen;
    
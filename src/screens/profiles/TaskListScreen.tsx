import React, {useEffect, useState, useCallback} from 'react';
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
import debounce from 'lodash/debounce';

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
      const tasksList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as TaskModel[];
      setTasks(tasksList);
      setFilteredTasks(tasksList);
    });

    return () => unsubscribe();
  }, [user, isCompleted, category]);

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      if (text === '') {
        setFilteredTasks(tasks);
      } else {
        const filtered = tasks.filter(task =>
          task.description.toLowerCase().includes(text.toLowerCase()),
        );
        setFilteredTasks(filtered);
      }
    }, 300),
    [tasks],
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const renderItem = ({item}: {item: TaskModel}) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetail', {taskId: item.id})}>
<Text style={styles.taskName}>{item.description}</Text>
      <Text style={styles.taskDescription}>{item.description}</Text>
    </TouchableOpacity>
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
            : category || 'Tất cả nhiệm vụ'}
        </Text>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm nhiệm vụ..."
        value={searchQuery}
        onChangeText={handleSearch}
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
    padding: 8,
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

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, {useEffect, useState} from 'react';
import {FlatList, Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {format, parseISO, isValid} from 'date-fns';
import {appColors} from '../../constants/appColor';
import {TaskModel} from '../../models/taskModel';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CompletedScreen = ({navigation}: {navigation: any}) => {
  const user = auth().currentUser;
  const [completedTasks, setCompletedTasks] = useState<TaskModel[]>([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .where('isCompleted', '==', true)
      .onSnapshot(snapshot => {
        const tasksList = snapshot.docs.map(doc => doc.data() as TaskModel);
        setCompletedTasks(tasksList);
      });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const formatDate = (date: string | Date, formatString: string) => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate)
      ? format(parsedDate, formatString)
      : 'Invalid date';
  };

  const renderTaskItem = ({item}: {item: TaskModel}) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetailScreen', {task: item})}>
      <Text style={styles.taskName}>{item.description}</Text>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <Text style={styles.taskDate}>
        {item.startDate
          ? `Bắt đầu: ${formatDate(item.startDate, 'dd/MM/yyyy HH:mm')}`
          : 'Không có ngày bắt đầu'}
      </Text>
      <Text style={styles.taskDate}>
        {item.isCompleted ? 'Hoàn thành' : 'Chưa hoàn thành'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Công việc đã hoàn thành</Text>
      </View>
      {completedTasks.length > 0 ? (
        <FlatList
          data={completedTasks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderTaskItem}
        />
      ) : (
        <Text style={styles.emptyText}>
          Không có công việc nào đã hoàn thành
        </Text>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  taskItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  taskName: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold', // Make the task title bold
  },
  taskDescription: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  taskDate: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default CompletedScreen;

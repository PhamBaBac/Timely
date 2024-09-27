import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SpaceComponent} from '../../components';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {appColors} from '../../constants/appColor';
import {TaskModel} from '../../models/taskModel';
import {CategoryModel} from '../../models/categoryModel';
import {DateTime} from '../../utils/DateTime';

const HomeScreen = ({navigation}: {navigation: any}) => {
  const user = auth().currentUser;
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [showBeforeToday, setShowBeforeToday] = useState(true);
  const [showToday, setShowToday] = useState(true);
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const tasksList = snapshot.docs.map(
          doc => ({id: doc.id, ...doc.data()} as TaskModel),
        );
        setTasks(tasksList);
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const categoriesList = snapshot.docs.map(
          doc => doc.data() as CategoryModel,
        );
        setCategories(categoriesList);
      });
    return () => unsubscribe();
  }, []);

  const filters = categories.reduce<string[]>(
    (acc, category: CategoryModel) => {
      if (!acc.includes(category.name)) {
        acc.push(category.name);
      }
      return acc;
    },
    ['Tất cả', 'Công việc', 'Sinh nhật'],
  );

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'Tất cả') return true;
    return task.category === activeFilter;
  });

  const today = DateTime.GetDate(new Date());
  const tasksBeforeToday = filteredTasks.filter(
    task =>
      task.startDate && DateTime.GetDate(new Date(task.startDate)) < today,
  );

  const tasksToday = filteredTasks.filter(
    task =>
      task.startDate && DateTime.GetDate(new Date(task.startDate)) == today,
  );

  const tasksAfterToday = filteredTasks.filter(
    task =>
      task.startDate && DateTime.GetDate(new Date(task.startDate)) > today,
  );

  const renderRightActions = (item: TaskModel) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={styles.swipeActionButton}
        onPress={() => handleHighlight(item.id)}>
        <MaterialIcons
          name="star"
          size={24}
          color={item.isImportant ? appColors.yellow : appColors.gray}
        />
        <Text style={styles.actionText}>Nổi bật</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.swipeActionButton}
        onPress={() => handleDelete(item.id)}>
        <MaterialIcons name="delete" size={24} color={appColors.red} />
        <Text style={styles.actionText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  const handleHighlight = async (taskId: string) => {
    try {
      const taskRef = firestore().collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();

      if (taskDoc.exists) {
        const currentIsImportant = taskDoc.data()?.isImportant;
        await taskRef.update({
          isImportant: !currentIsImportant,
        });
      }
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  };

  const handleDelete = (taskId: string) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa nhiệm vụ này?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('tasks').doc(taskId).delete();
            console.log(`Deleted task with id: ${taskId}`);
          } catch (error) {
            console.error('Error deleting task: ', error);
          }
        },
      },
    ]);
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const taskRef = firestore().collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();

      if (taskDoc.exists) {
        const currentCompleted = taskDoc.data()?.isCompleted || false;
        await taskRef.update({
          isCompleted: !currentCompleted,
        });
      }
    } catch (error) {
      console.error('Error updating task completion status: ', error);
    }
  };

  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('TaskDetailScreen', {task: task});
  };

  const renderTask = ({item}: {item: TaskModel}) => {
    if (!item) return null;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <TouchableOpacity onPress={() => handleTaskPress(item)}>
          <View style={styles.taskItem}>
            <TouchableOpacity
              style={styles.roundButton}
              onPress={() => handleToggleComplete(item.id)}>
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
            </TouchableOpacity>
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskTitle,
                  item.isCompleted && styles.completedTaskTitle,
                ]}>
                {item.description}
              </Text>
              <Text style={styles.taskDate}>
                {DateTime.GetDate(new Date(item.startDate || ''))}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={appColors.whitesmoke}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.openDrawer()}>
          <MaterialIcons name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="search" size={24} color={appColors.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {filters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter)}>
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter && styles.activeFilterText,
                ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tasksContainer}>
        {tasksBeforeToday.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setShowBeforeToday(!showBeforeToday)}
              style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Trước</Text>
              <MaterialIcons
                name={showBeforeToday ? 'expand-less' : 'expand-more'}
                size={24}
                color={appColors.black}
              />
            </TouchableOpacity>
            {showBeforeToday && (
              <FlatList
                data={tasksBeforeToday}
                keyExtractor={item => item.id}
                renderItem={renderTask}
                contentContainerStyle={styles.flatListContent}
              />
            )}
          </View>
        )}

        {tasksToday.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setShowToday(!showToday)}
              style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Hôm nay </Text>
              <MaterialIcons
                name={showToday ? 'expand-less' : 'expand-more'}
                size={24}
                color={appColors.black}
              />
            </TouchableOpacity>
            {showToday && (
              <FlatList
                data={tasksToday}
                keyExtractor={item => item.id}
                renderItem={renderTask}
                contentContainerStyle={styles.flatListContent}
              />
            )}
          </View>
        )}
        {tasksAfterToday.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setShowBeforeToday(!showBeforeToday)}
              style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Tương lai</Text>
              <MaterialIcons
                name={showBeforeToday ? 'expand-less' : 'expand-more'}
                size={24}
                color={appColors.black}
              />
            </TouchableOpacity>
            {showBeforeToday && (
              <FlatList
                data={tasksAfterToday}
                keyExtractor={item => item.id}
                renderItem={renderTask}
                contentContainerStyle={styles.flatListContent}
              />
            )}
          </View>
        )}
      </View>
      <SpaceComponent height={120} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.whitesmoke,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: appColors.white,
    borderBottomWidth: 1,
    borderBottomColor: appColors.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.black,
  },
  iconButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingBottom: 4,
  },
  filters: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: appColors.lightGray,
    borderRadius: 14,
    marginRight: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: appColors.primary,
  },
  filterButtonText: {
    fontSize: 15,
    color: appColors.gray,
  },
  activeFilterText: {
    color: appColors.white,
  },
  tasksContainer: {
    flex: 1,
  },
  section: {
    marginVertical: 4,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: appColors.white,
    borderRadius: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.gray,
  },
  flatListContent: {
    paddingTop: 4,
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

export default HomeScreen;

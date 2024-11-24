import auth, {firebase} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {addDays, addMonths, addWeeks, format} from 'date-fns';
import {
  Category2,
  Flag,
  Repeat,
  SearchNormal1,
  Star1,
  StarSlash,
  TickSquare,
  Trash,
} from 'iconsax-react-native';
import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {RowComponent, SpaceComponent} from '../../components';
import {appColors} from '../../constants/appColor';
import useCustomStatusBar from '../../hooks/useCustomStatusBar';
import {CategoryModel} from '../../models/categoryModel';
import {TaskModel} from '../../models/taskModel';
import {setCategories} from '../../redux/reducers/categoriesSlice';
import {setTasks} from '../../redux/reducers/tasksSlice';
import {RootState} from '../../redux/store';
import {HandleNotification} from '../../utils/handleNotification';
import {
  fetchCompletedTasks,
  fetchDeletedTasks,
  fetchImportantTasks,
  handleDeleteMultipleTasks,
  handleDeleteTask,
  handleToggleComplete,
  handleToggleImportant,
  handleUpdateRepeat,
} from '../../utils/taskUtil';
const initialState: CategoryModel[] = [
  {id: '1', name: 'Tất cả', icon: '', color: '#FF8A65'},
  {id: '2', name: 'Du lịch', icon: 'airplanemode-active', color: '#FF8A65'},
  {id: '3', name: 'Sinh nhật', icon: 'cake', color: '#FF8A65'},
];

const HomeScreen = ({navigation}: {navigation: any}) => {
  const user = auth().currentUser;
  //luu gia initialState vao redux
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setCategories(initialState));
  }, [dispatch]);
  useCustomStatusBar('light-content', appColors.primary);

  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [showBeforeToday, setShowBeforeToday] = useState(true);
  const [showToday, setShowToday] = useState(true);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  console.log('selectedTaskIds:', selectedTaskIds);
  useEffect(() => {
    HandleNotification.checkNotificationPersion();
    messaging().onMessage((mess: any) => {
      // getNofiticationsUnRead;
      console.log('mess:', mess);
    });
  }, []);

  const categories = useSelector(
    (state: RootState) => state.categories.categories,
  );

  const deletedTaskIds = useSelector(
    (state: RootState) => state.tasks.deletedTaskIds,
  );
  const completedTasks = useSelector(
    (state: RootState) => state.tasks.completedTasks,
  );

  const isImportantTasks = useSelector(
    (state: RootState) => state.tasks.isImportantTasks,
  );

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const categoriesList = snapshot.docs.map(
          doc => doc.data() as CategoryModel,
        );
        dispatch(setCategories(categoriesList));
      });
    return () => unsubscribe();
  }, [dispatch, user]);
  const filters = categories.reduce<
    {name: string; icon: string; color?: string}[]
  >(
    (acc, category: CategoryModel) => {
      if (!acc.find(item => item.name === category.name)) {
        acc.push({name: category.name, icon: category.icon});
      }
      return acc;
    },
    [
      {name: 'Tất cả', icon: ''},
      ...categories.map(category => ({
        name: category.name,
        icon: category.icon,
        color: category.color,
      })),
    ],
  );

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'Tất cả') return true;
    return task.category === activeFilter;
  });
  useEffect(() => {
    fetchDeletedTasks(dispatch);
    fetchCompletedTasks(dispatch);
    fetchImportantTasks(dispatch);
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const categoriesList = snapshot.docs.map(
          doc => doc.data() as CategoryModel,
        );
        dispatch(setCategories(categoriesList));
      });
    return () => unsubscribe();
  }, [dispatch, user]);
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const tasksList = snapshot.docs.map(doc => {
          const taskData = doc.data() as TaskModel;

          // Chuyển đổi dueDate và startTime (nếu có) thành Date hoặc chuỗi ISO
          const dueDate =
            taskData.dueDate instanceof firebase.firestore.Timestamp
              ? taskData.dueDate.toDate().toISOString()
              : taskData.dueDate;

          const startTime =
            taskData.startTime instanceof firebase.firestore.Timestamp
              ? taskData.startTime.toDate().toISOString()
              : taskData.startTime;

          const endDate =
            taskData.endDate instanceof firebase.firestore.Timestamp
              ? taskData.endDate.toDate().toISOString()
              : taskData.endDate; // Giữ nguyên nếu không phải Timestamp

          return {
            ...taskData,
            id: doc.id,
            dueDate,
            startTime,
            endDate,
          } as TaskModel;
        });

        const allTasksWithRepeats = tasksList.flatMap(task => {
          if (task.repeat === 'no' || !task.repeat || !task.startDate) {
            return [task];
          }

          const repeatedDates = calculateRepeatedDates(
            task.startDate,
            task.repeat as 'day' | 'week' | 'month',
            task.repeatCount as number,
            task.repeatDays as number[],
          );

          return repeatedDates.map(date => ({
            ...task,
            id: `${task.id}-${date}`,
            startDate: date,
          }));
        });

        const filteredTasks = allTasksWithRepeats.filter(
          task => !deletedTaskIds.includes(task.id),
        );

        const restoredTasks = filteredTasks.map(task => ({
          ...task,
          isCompleted: completedTasks[task.id] || task.isCompleted,
          isImportant: isImportantTasks[task.id] || task.isImportant,
        }));

        dispatch(setTasks(restoredTasks));
      });

    return () => unsubscribe();
  }, [dispatch, user, deletedTaskIds, completedTasks, isImportantTasks]);

  const handleDelete = (taskId: string, repeatCount: number) => {
    handleDeleteTask(taskId, dispatch, repeatCount);
  };

  const handleToggleCompleteTask = (taskId: string) => {
    handleToggleComplete(taskId, tasks, dispatch);
  };

  const handleHighlight = async (taskId: string) => {
    handleToggleImportant(taskId, tasks, dispatch);
  };

  const handleUpdateRepeatTask = (taskId: string) => {
    handleUpdateRepeat(taskId);
  };

  // const handleDeleteAll = () => {
  //   handleDeleteAllTasks(tasks, dispatch);
  // }

  const handleDeleteSelectedTasks = () => {
    handleDeleteMultipleTasks(tasks, selectedTaskIds, dispatch);
    setSelectedTaskIds([]);
    setIsDeleteAll(false);
  };
  const calculateRepeatedDates = (
    startDate: string,
    repeat: 'day' | 'week' | 'month',
    count: number,
    repeatDays: number[],
  ) => {
    const dates = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
      dates.push(currentDate.toISOString());

      if (repeat === 'day') {
        currentDate = addDays(currentDate, 1);
      } else if (repeat === 'week' && repeatDays.length === 0) {
        currentDate = addWeeks(currentDate, 1);
      } else if (repeat === 'month' && repeatDays.length === 0) {
        currentDate = addMonths(currentDate, 1);
      } else if (repeat === 'week' && repeatDays.length > 0) {
        repeatDays.forEach(day => {
          let tempDate = new Date(currentDate);
          tempDate.setDate(
            tempDate.getDate() + ((day + 7 - tempDate.getDay()) % 7),
          );
          if (tempDate > currentDate) {
            dates.push(tempDate.toISOString());
          }
        });
        currentDate = addWeeks(currentDate, 1);
      } else if (repeat === 'month' && repeatDays.length > 0) {
        repeatDays.forEach(day => {
          let tempDate = new Date(currentDate);
          tempDate.setDate(day);
          if (tempDate > currentDate) {
            dates.push(tempDate.toISOString());
          }
        });
        currentDate = addMonths(currentDate, 1);
      }
    }

    return dates;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  const tasksBeforeToday = filteredTasks.filter(task => {
    const taskStartDate = new Date(task.startDate || '');
    taskStartDate.setHours(0, 0, 0, 0);
    return taskStartDate < today && !task.isCompleted;
  });

  const sortedTasksBeforeToday = tasksBeforeToday.sort((a, b) => {
    const dateA = new Date(a.startDate || '').getTime();
    const dateB = new Date(b.startDate || '').getTime();
    return dateB - dateA;
  });

  const uniqueTasksBeforeTodayMap = new Map<string, TaskModel>();

  sortedTasksBeforeToday.forEach(task => {
    if (!uniqueTasksBeforeTodayMap.has(task.title)) {
      uniqueTasksBeforeTodayMap.set(task.title, task);
    }
  });

  const uniqueTasksBeforeToday = Array.from(uniqueTasksBeforeTodayMap.values());

  const tasksToday = filteredTasks.filter(task => {
    const taskStartDate = new Date(task.startDate || '');
    taskStartDate.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00
    return taskStartDate.getTime() === today.getTime() && !task.isCompleted;
  });

  //sap xep theo  priority(low, medium, high) va gio bat dau
  tasksToday.sort((a, b) => {
    if (a.priority === 'low' && b.priority !== 'low') {
      return 1;
    }
    if (a.priority === 'medium' && b.priority === 'high') {
      return 1;
    }
    if (a.priority === 'high' && b.priority !== 'high') {
      return -1;
    }
    if (a.startTime && b.startTime) {
      return a.startTime.toString().localeCompare(b.startTime.toString());
    }
    return 0;
  });

  const tasksAfterToday = filteredTasks.filter(task => {
    const taskStartDate = new Date(task.startDate || '');
    taskStartDate.setHours(0, 0, 0, 0);
    return taskStartDate > today && !task.isCompleted;
  });

  const sortedTasks = tasksAfterToday.sort((a, b) => {
    const dateA = new Date(a.startDate || '').getTime();
    const dateB = new Date(b.startDate || '').getTime();
    return dateA - dateB;
  });

  const uniqueTasksMap = new Map<string, TaskModel>();

  sortedTasks.forEach(task => {
    if (!uniqueTasksMap.has(task.title)) {
      uniqueTasksMap.set(task.title, task);
    }
  });
  const uniqueTasks = Array.from(uniqueTasksMap.values()).slice(0, 5);

  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('TaskDetailsScreen', {id: task.id});
  };

  const renderTask = (item: TaskModel) => {
    if (!item) return null;

    const renderRightActions = (item: TaskModel) => (
      <View style={styles.swipeActions}>
        <Pressable
          style={styles.swipeActionButton}
          onPress={() => handleDelete(item.id, item.repeatCount)}>
          <Trash size={24} color={appColors.red} variant="Bold" />
          <Text style={styles.actionText}>Xóa</Text>
        </Pressable>

        {item.repeat !== 'no' && (
          <Pressable
            style={styles.swipeActionButton}
            onPress={() => handleUpdateRepeatTask(item.id)}>
            <Repeat size="24" color={appColors.blue} />
            <Text style={styles.actionText}>Bỏ lặp lại</Text>
          </Pressable>
        )}
      </View>
    );
    const categoryIcon =
      categories.find(category => category.name === item.category)?.icon ||
      (item.category === 'Du lịch'
        ? 'airplanemode-active'
        : item.category === 'Sinh nhật'
        ? 'cake'
        : '');

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        key={item.id}>
        <Pressable onPress={() => handleTaskPress(item)}>
          <View
            style={[
              styles.taskItem,
              {
                borderLeftColor: item.isCompleted
                  ? appColors.gray
                  : appColors.primary,
              },
              {
                backgroundColor: selectedTaskIds.includes(item.id)
                  ? appColors.gray2
                  : item.isCompleted
                  ? appColors.gray2
                  : appColors.white,
              },
            ]}>
            <Pressable
              style={styles.roundButton}
              onPress={() => {
                if (!isDeleteAll) {
                  handleToggleCompleteTask(item.id);
                } else {
                  if (selectedTaskIds.includes(item.id)) {
                    setSelectedTaskIds(
                      selectedTaskIds.filter(id => id !== item.id),
                    );
                  } else {
                    setSelectedTaskIds([...selectedTaskIds, item.id]);
                  }
                }
              }}>
              {isDeleteAll ? (
                selectedTaskIds.includes(item.id) ? (
                  <TickSquare
                    size={24}
                    color={appColors.primary}
                    variant="Bold"
                  />
                ) : (
                  <MaterialIcons
                    name="radio-button-unchecked"
                    size={24}
                    color={appColors.primary}
                  />
                )
              ) : item.isCompleted ? (
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
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.taskDate}>
                    {item.dueDate
                      ? fomatDate(new Date(item.startDate || ''))
                      : 'No due date'}{' '}
                    -{' '}
                    {item.startTime
                      ? formatTime(item.startTime)
                      : 'No start time'}
                    <SpaceComponent width={10} />
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    {categoryIcon && (
                      <MaterialIcons
                        name={categoryIcon}
                        size={16}
                        color={appColors.gray2}
                      />
                    )}
                    <SpaceComponent width={10} />
                    {item.repeat !== 'no' && (
                      <Repeat size="16" color={appColors.gray2} />
                    )}
                  </View>
                </View>
              </View>
              <View>
                {item.priority === 'low' && (
                  <Flag size="24" color={appColors.green} variant="Bold" />
                )}
                {item.priority === 'medium' && (
                  <Flag size="24" color={appColors.yellow} variant="Bold" />
                )}
                {item.priority === 'high' && (
                  <Flag size="24" color={appColors.red} variant="Bold" />
                )}
              </View>
              <SpaceComponent width={10} />
              <Pressable
                style={{
                  paddingRight: 40,
                }}
                onPress={() => handleHighlight(item.id)}>
                {item.isImportant ? (
                  <Star1 size={24} color="#FF8A65" />
                ) : (
                  <StarSlash size={24} color="#FF8A65" />
                )}
              </Pressable>
            </RowComponent>
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.openDrawer()}>
          <MaterialIcons name="menu" size={24} color={appColors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>TimeLy</Text>
        <Pressable
          style={styles.iconButton}
          onPress={() =>
            navigation.navigate('ListTasks', {
              tasks,
            })
          }>
          <SearchNormal1 size={20} color={appColors.white} />
        </Pressable>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {filters.map((filter, index) => (
            <Pressable
              key={index}
              style={[
                styles.filterButton,
                activeFilter === filter.name && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter.name)}>
              <RowComponent>
                {filter.icon && (
                  <MaterialIcons
                    name={filter.icon}
                    size={20}
                    color={
                      activeFilter === filter.name
                        ? appColors.white
                        : filter.color
                    }
                  />
                )}
                <SpaceComponent width={4} />
                <Text
                  style={[
                    styles.filterButtonText,
                    activeFilter === filter.name && styles.activeFilterText,
                  ]}>
                  {filter.name}
                </Text>
              </RowComponent>
            </Pressable>
          ))}
        </ScrollView>
        <SpaceComponent width={10} />
        <Pressable
          onPress={() => {
            // Xử lý sự kiện thêm danh mục
            navigation.navigate('Category');
          }}>
          <Category2 size="24" color={appColors.primary} />
        </Pressable>
      </View>
      {tasks.length > 0 && (
        <RowComponent
          styles={{
            justifyContent: 'flex-start',
            marginLeft: 10,
          }}>
          {!isDeleteAll ? (
            <Pressable
              style={{flexDirection: 'row', alignItems: 'center'}}
              onPress={() => {
                const allTaskIds = tasks.map(task => task.id);
                setSelectedTaskIds(allTaskIds);
                setIsDeleteAll(true);
              }}>
              <TickSquare size={24} color={appColors.primary} />
              <SpaceComponent width={5} />
              <Text style={{color: appColors.black}}>Nhấn để chọn tất cả</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                setSelectedTaskIds([]);
                setIsDeleteAll(false);
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <TickSquare size={24} color={appColors.primary} variant="Bold" />
              <SpaceComponent width={5} />
              <Pressable
                onPress={() => {
                  handleDeleteSelectedTasks();
                }}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                <Text style={{color: appColors.black}}>Xóa tất cả</Text>
              </Pressable>
            </Pressable>
          )}
        </RowComponent>
      )}
      <ScrollView style={styles.tasksContainer}>
        {tasksBeforeToday.length > 0 && (
          <View style={styles.section}>
            <Pressable
              onPress={() => setShowBeforeToday(!showBeforeToday)}
              style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Trước</Text>
              <MaterialIcons
                name={showBeforeToday ? 'expand-less' : 'expand-more'}
                size={24}
                color={appColors.gray}
              />
            </Pressable>
            {showBeforeToday && uniqueTasksBeforeToday.map(renderTask)}
          </View>
        )}

        {tasksToday.length > 0 && (
          <View style={styles.section}>
            <Pressable
              onPress={() => setShowToday(!showToday)}
              style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Hôm nay </Text>
              <MaterialIcons
                name={showToday ? 'expand-less' : 'expand-more'}
                size={24}
                color={appColors.gray}
              />
            </Pressable>
            {showToday && tasksToday.map(renderTask)}
          </View>
        )}
        {tasksAfterToday.length > 0 && (
          <View style={styles.section}>
            <Pressable
              onPress={() => setShowBeforeToday(!showBeforeToday)}
              style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Tương lai</Text>
              <MaterialIcons
                name={showBeforeToday ? 'expand-less' : 'expand-more'}
                size={24}
                color={appColors.gray}
              />
            </Pressable>
            {showBeforeToday && uniqueTasks.map(renderTask)}
          </View>
        )}

        {tasks.filter(
          task =>
            task.isCompleted &&
            new Date(task.updatedAt).toDateString() === today.toDateString(),
        ).length > 0 && (
          <View style={styles.section}>
            <Pressable
              onPress={() => setShowBeforeToday(!showBeforeToday)}
              style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Đã hoàn thành hôm nay</Text>
              <MaterialIcons
                name={showBeforeToday ? 'expand-less' : 'expand-more'}
                size={24}
                color={appColors.gray}
              />
            </Pressable>
            {showBeforeToday &&
              tasks
                .filter(
                  task =>
                    task.isCompleted &&
                    new Date(task.updatedAt).toDateString() ===
                      today.toDateString(),
                )
                .map(renderTask)}
          </View>
        )}
        <SpaceComponent height={20} />
        <Pressable
          onPress={() =>
            navigation.navigate('IsCompleTaskScreen', {
              tasks: tasks.filter(task => task.isCompleted),
            })
          }>
          <Text style={{textDecorationLine: 'underline', textAlign: 'center'}}>
            Xem tất cả các nhiệm vụ đã hoàn thành
          </Text>
        </Pressable>
      </ScrollView>
      <SpaceComponent height={28} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.lightPurple,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: -10,
    paddingBottom: 20,
    backgroundColor: appColors.primary,
    borderBottomWidth: 1,
    borderBottomColor: appColors.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.white,
  },
  iconButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingHorizontal: 10,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: appColors.gray2,
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
    color: appColors.black,
  },
  activeFilterText: {
    color: appColors.white,
  },
  tasksContainer: {
    flex: 1,
    paddingHorizontal: 10,
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
    // backgroundColor: appColors.white,
    borderRadius: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.gray,
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
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
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

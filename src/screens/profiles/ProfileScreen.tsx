import {addDays, endOfWeek, format, startOfWeek} from 'date-fns';
import React, {useEffect, useState} from 'react';
import auth, {firebase} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {RowComponent, TextComponent} from '../../components';
import {appColors} from '../../constants';
import CicularComponent from '../../components/CicularComponent';
import useCustomStatusBar from '../../hooks/useCustomStatusBar';
import {TaskModel} from '../../models/taskModel';
import {fetchTasks} from '../../utils/taskUtil';

import TaskCompletionChart from '../../components/TaskCompletionChart';

const ProfileScreen = ({navigation}: {navigation: any}) => {
  useCustomStatusBar('dark-content', appColors.lightPurple);

  const currentUser =
    auth().currentUser?.displayName || auth().currentUser?.email;
  const [completedTasks, setCompletedTasks] = useState(0);
  const [incompleteTasks, setIncompleteTasks] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const timeOptions = [
    {label: 'Tất cả', value: 'all'},
    {label: '7 Ngày', value: '7'},
    {label: '30 Ngày', value: '30'},
  ];

  const handlePeriodSelect = (value: string) => {
    setSelectedPeriod(value);
    setModalVisible(false);
  };

  const getWeekRange = (offset: number) => {
    const today = new Date();
    const start = startOfWeek(addDays(today, offset * 7), {weekStartsOn: 1});
    const end = endOfWeek(addDays(today, offset * 7), {weekStartsOn: 1});
    return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;
  };
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const user = auth().currentUser;

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = fetchTasks(user.uid, setTasks);

      // Cleanup on unmount
      return () => unsubscribe();
    }
  }, [user?.uid]);

  const calculateTaskStats = (tasks: TaskModel[]) => {
    const currentDate = new Date();

    const completedTasks = tasks.filter(task => task.isCompleted).length;

    const incompleteTasks = tasks.filter(
      task =>
        !task.isCompleted &&
        task.dueDate &&
        new Date(task.dueDate) <= currentDate,
    ).length;

    return {completedTasks, incompleteTasks};
  };

  const calculateTaskCompletionStats = (tasks: TaskModel[]) => {
    const currentDate = new Date();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;

    const completedAheadOfSchedule = tasks.filter(
      task =>
        task.isCompleted &&
        task.dueDate &&
        task.updatedAt &&
        new Date(task.updatedAt) < new Date(task.dueDate),
    ).length;

    const completedOnTime = tasks.filter(
      task =>
        task.isCompleted &&
        task.dueDate &&
        new Date(task.updatedAt) <= new Date(task.dueDate) &&
        new Date(task.dueDate) <= currentDate,
    ).length;

    const overdueTasks = tasks.filter(
      task =>
        !task.isCompleted &&
        task.dueDate &&
        new Date(task.dueDate) < currentDate,
    ).length;

    const incompleteTasks = tasks.filter(task => !task.isCompleted).length;
    return {
      totalTasks,
      completedTasks,
      completedAheadOfSchedule,
      completedOnTime,
      incompleteTasks,
      overdueTasks,
    };
  };

  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completedAheadOfSchedule: 0,
    incompleteTasks: 0,
  });

  useEffect(() => {
    const {completedTasks: completed, incompleteTasks: incomplete} =
      calculateTaskStats(tasks);
    setCompletedTasks(completed);
    setIncompleteTasks(incomplete);

    const stats = calculateTaskCompletionStats(tasks);
    setTaskStats(stats);
  }, [tasks]);

  const filterTasksByPeriod = (tasks: TaskModel[], period: string) => {
    const currentDate = new Date();
    if (period === 'all') return tasks;

    const days = parseInt(period);
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + days);

    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : new Date();
      return taskDate >= currentDate && taskDate <= futureDate;
    });
  };

  const filteredTasks = filterTasksByPeriod(tasks, selectedPeriod);

  const isWithinWeek = (date: number, offset: number) => {
    const taskDate = new Date(date);
    const start = startOfWeek(addDays(new Date(), offset * 7), {
      weekStartsOn: 1,
    });
    const end = endOfWeek(addDays(new Date(), offset * 7), {weekStartsOn: 1});
    return taskDate >= start && taskDate <= end;
  };

  const handleViewTasks = (isCompleted: boolean) => {
    navigation.navigate('TaskListScreen', {isCompleted});
  };

  const completedOnTime = tasks.filter(task => {
    const startDate = task.startDate ? new Date(task.startDate) : null;
    const endDate = task.endDate ? new Date(task.endDate) : null;
    const completedAt = new Date(task.updatedAt);
    return (
      task.isCompleted &&
      ((startDate && completedAt <= startDate) ||
        (endDate && completedAt <= endDate))
    );
  }).length;

  const overdueTasks = tasks.filter(task => {
    const startDate = task.startDate ? new Date(task.startDate) : null;
    const endDate = task.endDate ? new Date(task.endDate) : null;
    const completedAt = new Date(task.updatedAt);
    return (
      task.isCompleted &&
      ((startDate && completedAt > startDate) ||
        (endDate && completedAt > endDate) ||
        (!startDate && !endDate))
    );
  }).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={50} color="#ffffff" />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>{currentUser}</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => handleViewTasks(true)}>
            <Text style={styles.statNumber}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Công việc đã hoàn thành</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => handleViewTasks(false)}>
            <Text style={styles.statNumber}>{incompleteTasks}</Text>
            <Text style={styles.statLabel}>Công việc chưa hoàn thành</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              {timeOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    index !== timeOptions.length - 1 &&
                      styles.modalOptionBorder,
                  ]}
                  onPress={() => handlePeriodSelect(option.value)}>
                  <Text style={styles.modalOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

        <RowComponent>
          <TextComponent
            styles={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#000',
              flex: 1,
              textAlign: 'left',
              paddingLeft: 10,
            }}
            text="Hoàn thành hằng ngày"
          />
          <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
            <MaterialIcons name="keyboard-arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text
            style={{
              color: appColors.text,
            }}>
            {getWeekRange(weekOffset)}
          </Text>
          <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#000" />
          </TouchableOpacity>
        </RowComponent>
        <BarChart
          data={{
            labels: [
              'Thứ 2',
              'Thứ 3',
              'Thứ 4',
              'Thứ 5',
              'Thứ 6',
              'Thứ 7',
              'Chủ nhật',
            ],
            datasets: [
              {
                data: [
                  tasks.filter(
                    task =>
                      task.isCompleted &&
                      isWithinWeek(task.updatedAt, weekOffset) &&
                      new Date(task.updatedAt ?? '').getDay() === 1,
                  ).length,
                  tasks.filter(
                    task =>
                      task.isCompleted &&
                      isWithinWeek(task.updatedAt, weekOffset) &&
                      new Date(task.updatedAt ?? '').getDay() === 2,
                  ).length,
                  tasks.filter(
                    task =>
                      task.isCompleted &&
                      isWithinWeek(task.updatedAt, weekOffset) &&
                      new Date(task.updatedAt ?? '').getDay() === 3,
                  ).length,
                  tasks.filter(
                    task =>
                      task.isCompleted &&
                      isWithinWeek(task.updatedAt, weekOffset) &&
                      new Date(task.updatedAt ?? '').getDay() === 4,
                  ).length,
                  tasks.filter(
                    task =>
                      task.isCompleted &&
                      isWithinWeek(task.updatedAt, weekOffset) &&
                      new Date(task.updatedAt ?? '').getDay() === 5,
                  ).length,
                  tasks.filter(
                    task =>
                      task.isCompleted &&
                      isWithinWeek(task.updatedAt, weekOffset) &&
                      new Date(task.updatedAt ?? '').getDay() === 6,
                  ).length,
                  tasks.filter(
                    task =>
                      task.isCompleted &&
                      isWithinWeek(task.updatedAt, weekOffset) &&
                      new Date(task.updatedAt ?? '').getDay() === 0,
                  ).length,
                ],
              },
            ],
          }}
          width={Dimensions.get('window').width - 46}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: () => appColors.primary,
            style: {
              borderRadius: 8,
              justifyContent: 'center',
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              strokeWidth: 0,
            },
            barPercentage: 0.4,
            formatYLabel: () => '',
            propsForLabels: {
              fontSize: 14,
            },
          }}
          style={{
            paddingLeft: 8,
            paddingRight: 12,
            marginVertical: 10,
            borderRadius: 16,
          }}
          showValuesOnTopOfBars={true}
          fromZero={true}
        />
        <RowComponent>
          <TextComponent
            text="Loại công việc chưa hoàn thành"
            styles={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#000',
              flex: 1,
              textAlign: 'left',
              paddingLeft: 10,
            }}
          />
          <View style={styles.periodWrapper}>
            <TouchableOpacity
              style={styles.periodSelector}
              onPress={() => setModalVisible(true)}>
              <Text style={styles.periodSelectorText}>
                {timeOptions.find(option => option.value === selectedPeriod)
                  ?.label || 'Tất cả'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </RowComponent>
        <View style={{padding: 10}}>
          <CicularComponent tasks={filteredTasks} />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 16,
            paddingTop: 10,
            marginHorizontal: 10,
            color: '#000',
          }}>
          Thống kê trạng thái công việc
        </Text>

        <View
          style={{
            paddingHorizontal: 4,
          }}>
          <TaskCompletionChart
            completedOnTime={completedOnTime}
            overdueTasks={overdueTasks}
            completedAheadOfSchedule={taskStats.completedAheadOfSchedule}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.lightPurple,
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: appColors.white,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appColors.text,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
  },
  categoryCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  periodWrapper: {
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  periodSelectorText: {
    color: '#000',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '40%',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 20,
    marginTop: 328,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
});

export default ProfileScreen;

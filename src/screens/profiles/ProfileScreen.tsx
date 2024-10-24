import {addDays, endOfWeek, format, startOfWeek} from 'date-fns';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {RowComponent, TextComponent} from '../../components';
import {RootState} from '../../redux/store';
import {appColors} from '../../constants';
import CicularComponent from '../../components/CicularComponent';
import auth from '@react-native-firebase/auth';

const ProfileScreen = ({navigation}: {navigation: any}) => {
  const currentUser = auth().currentUser?.email;
  const [completedTasks, setCompletedTasks] = useState(0);
  const [incompleteTasks, setIncompleteTasks] = useState(0);

  const getWeekRange = (offset: number) => {
    const today = new Date();
    const start = startOfWeek(addDays(today, offset * 7), {weekStartsOn: 1});
    const end = endOfWeek(addDays(today, offset * 7), {weekStartsOn: 1});
    return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;
  };
  const [weekOffset, setWeekOffset] = useState(0);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  useEffect(() => {
    let completed = 0;
    let incomplete = 0;
    const categoryCount: {[key: string]: number} = {};
    let uncategorizedCount = 0;

    tasks.forEach(task => {
      if (task.isCompleted) {
        completed++;
      } else {
        incomplete++;
      }

      if (task.category) {
        if (!categoryCount[task.category]) {
          categoryCount[task.category] = 0;
        }
        categoryCount[task.category]++;
      } else {
        uncategorizedCount++;
      }
    });

    setCompletedTasks(completed);
    setIncompleteTasks(incomplete);

  }, [tasks]);

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
            <Text style={styles.statLabel}>Nhiệm vụ đã hoàn thành</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => handleViewTasks(false)}>
            <Text style={styles.statNumber}>{incompleteTasks}</Text>
            <Text style={styles.statLabel}>Nhiệm vụ chưa hoàn thành</Text>
          </TouchableOpacity>
        </View>

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
              strokeDasharray: '', // Loại bỏ các đường gạch ngang
              strokeWidth: 0, // Đặt độ dày đường kẻ ngang về 0
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
        <TextComponent
          text="Công việc chưa hoàn thành"
          styles={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#000',
            flex: 1,
            textAlign: 'left',
            paddingLeft: 10,
          }}
        />
        <View style={{padding: 10}}>
          <CicularComponent tasks={tasks} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.whitesmoke,
    padding: 16,
    paddingBottom: 40
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
    backgroundColor: '#000',
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
});

export default ProfileScreen;


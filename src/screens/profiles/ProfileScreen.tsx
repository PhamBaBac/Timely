import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {BarChart} from 'react-native-chart-kit';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({navigation}: {navigation: any}) => {
  const user = auth().currentUser;
  const [completedTasks, setCompletedTasks] = useState(0);
  const [incompleteTasks, setIncompleteTasks] = useState(0);
  const [categories, setCategories] = useState<{name: string; count: number}[]>(
    [],
  );

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        let completed = 0;
        let incomplete = 0;
        const categoryCount: {[key: string]: number} = {};
        let uncategorizedCount = 0;

        snapshot.forEach(doc => {
          const task = doc.data();
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
        setCategories([
          ...Object.keys(categoryCount).map(name => ({
            name,
            count: categoryCount[name],
          })),
          {name: 'Chưa phân loại', count: uncategorizedCount},
        ]);
      });

    return () => unsubscribe();
  }, [user]);

  const data = {
    labels: ['Hoàn thành', 'Chưa hoàn thành'],
    datasets: [
      {
        data: [completedTasks, incompleteTasks],
        colors: [
          (opacity = 1) => `rgba(75, 181, 67, ${opacity})`, // Màu xanh lá đậm cho nhiệm vụ hoàn thành
          (opacity = 1) => `rgba(255, 164, 0, ${opacity})`, // Màu cam cho nhiệm vụ chưa hoàn thành
        ],
      },
    ],
  };

  const handleViewTasks = (isCompleted: boolean) => {
    navigation.navigate('TaskListScreen', {isCompleted});
  };

  const handleViewCategoryTasks = (category: string) => {
    navigation.navigate('TaskListScreen', {category});
  };

  const renderCategoryItem = ({
    item,
  }: {
    item: {name: string; count: number};
  }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleViewCategoryTasks(item.name)}>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.count}</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={50} color="#ffffff" />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>Username</Text>
        </View>
      </View>

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

      <Text style={styles.sectionTitle}>Biểu đồ thống kê</Text>
      <BarChart
        data={data}
        width={Dimensions.get('window').width - 30}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1, index) =>
            data.datasets[0].colors[index ?? 0](opacity),
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.5,
          propsForLabels: {
            fontSize: 14,
          },
          formatYLabel: value => Math.round(Number(value)).toString(),
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        showValuesOnTopOfBars={true}
        fromZero={true}
      />

      <Text style={styles.sectionTitle}>Phân loại danh mục</Text>
    </>
  );

  return (
    <FlatList
      style={styles.container}
      data={categories}
      renderItem={renderCategoryItem}
      keyExtractor={item => item.name}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Không có danh mục nào</Text>
      }
    />
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
    fontSize: 24,
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
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
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

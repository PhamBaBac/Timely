import React, {useState} from 'react';
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
import {ButtonComponent, SpaceComponent} from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {appColors} from './../../constants/appColor';

type Task = {
  id: string;
  title: string;
  date?: string;
  category?: string;
};

const HomeScreen = ({navigation}: {navigation: any}) => {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [showBeforeToday, setShowBeforeToday] = useState(true);
  const [showToday, setShowToday] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Đi đá bóng',
      date: '2023-09-05',
      category: 'Công việc',
    },
    {id: '2', title: 'Đi học', date: '2024-09-22', category: 'Công việc'},
    {id: '3', title: 'Đi sinh nhật', date: '2023-09-04', category: 'Sinh nhật'},
  ];

  const filters = tasks.reduce<string[]>(
    (acc, task: any) => {
      if (!acc.includes(task.category)) {
        acc.push(task.category);
      }
      return acc;
    },
    ['Tất cả'],
  );
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'Tất cả') return true;
    return task.category === activeFilter;
  });

  const today = new Date().toISOString().split('T')[0];

  const tasksBeforeToday = filteredTasks.filter(
    task => task.date && task.date < today,
  );

  const tasksToday = filteredTasks.filter(
    task => task.date && task.date === today,
  );

  const renderRightActions = (item: Task) => (
    <View style={styles.swipeActions}>
      <TouchableOpacity
        style={styles.swipeActionButton}
        onPress={() => handleHighlight(item.id)}>
        <MaterialIcons name="star" size={24} color={appColors.yellow} />
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

  const handleHighlight = (taskId: string) => {
    Alert.alert(
      'Nhiệm vụ nổi bật',
      `Nhiệm vụ ${taskId} đã được đánh dấu nổi bật!`,
    );
  };

  const handleDelete = (taskId: string) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa nhiệm vụ này?', [
      {text: 'Hủy', style: 'cancel'},
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          console.log(`Deleted task with id: ${taskId}`);
        },
      },
    ]);
  };

  const renderTask = ({item}: {item: Task}) => {
    if (!item) return null;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <View style={styles.taskItem}>
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDate}>{formatDate(item.date || '')}</Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  const handleSingout = async () => {
    const token = await AsyncStorage.getItem('fcmtoken');
    const currentUser = auth().currentUser;
    if (currentUser) {
      await firestore()
        .doc(`users/${currentUser.uid}`)
        .get()
        .then(snap => {
          if (snap.exists) {
            const data: any = snap.data();
            if (data.tokens && data.tokens.includes(token)) {
              firestore()
                .doc(`users/${currentUser.uid}`)
                .update({
                  tokens: firestore.FieldValue.arrayRemove(token),
                })
                .then(() => {
                  console.log('Token removed from Firestore');
                })
                .catch(error => {
                  console.error('Error removing token from Firestore:', error);
                });
            } else {
              console.log('Token not found in Firestore');
            }
          }
        })
        .catch(error => {
          console.error('Error getting document:', error);
        });
    }
    await auth().signOut();

    await AsyncStorage.removeItem('fcmtoken');
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
              <Text style={styles.sectionHeader}>
                Hôm nay ({formatDate(today)})
              </Text>
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
      </View>

      <ButtonComponent type="primary" text="Log out" onPress={handleSingout} />
      <SpaceComponent height={120} />
    </View>
  );
};

export default HomeScreen;

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
    justifyContent: 'space-between',
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
  taskContent: {
    flexDirection: 'column',
  },
  taskTitle: {
    fontSize: 16,
    color: appColors.black,
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

import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type Task = {
  id: string;
  title: string;
  date?: string;
  section: string;
};

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  const tasks: Task[] = [
    { id: '1', title: 'Đi đá bóng', date: '09/05', section: 'Trước' },
    { id: '2', title: 'Đi học', section: 'Hôm nay' },
    { id: '3', title: 'Làm bài tập', section: 'Hôm nay' },
  ];

  const filters = ['Tất cả', 'Ngày sinh nhật', 'Công việc', 'Học tập', 'Khác'];

  const filteredTasks = activeFilter === 'Tất cả' ? tasks : tasks.filter(task => task.section === activeFilter);

  const renderTask = ({ item }: { item: Task }) => {
    if (!item) return null;

    return (
      <View style={styles.taskItem}>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          {item.date ? <Text style={styles.taskDate}>{item.date}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.openDrawer()}>
          <MaterialIcons name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.flatListContent}
        ListHeaderComponent={() => (
          <View>
            {filteredTasks.some(task => task.section === 'Trước') && (
              <Text style={styles.sectionHeader}>Trước</Text>
            )}
            {filteredTasks.some(task => task.section === 'Hôm nay') && (
              <Text style={styles.sectionHeader}>Hôm nay</Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eaeaea',
    borderRadius: 12,
    marginRight: 6,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  flatListContent: {
    paddingTop: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 8,
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  taskContent: {
    flexDirection: 'column',
  },
  taskTitle: {
    fontSize: 16,
    color: '#000',
  },
  taskDate: {
    fontSize: 14,
    color: '#f00',
    marginTop: 4,
  },
});

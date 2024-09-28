import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.title}>Username</Text>
          <Text style={styles.subtitle}>Bấm để đăng nhập</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Tổng quan về Nhiệm vụ</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Nhiệm vụ đã hoàn thành</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>nhiệm vụ chưa hoàn thành</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Hoàn thành nhiệm vụ hàng ngày</Text>
      <Text style={styles.chartSubtitle}>9/22-9/28</Text>

      <View style={styles.chart}>
        <Text style={styles.noDataText}>Không có dữ liệu nhiệm vụ</Text>
      </View>

      <Text style={styles.sectionTitle}>Nhiệm vụ trong 7 ngày tới</Text>

      <View style={styles.taskTypeContainer}>
        <Text style={styles.taskTypeTitle}>
          Phân loại nhiệm vụ chưa hoàn thành
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDD',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
  },
  chart: {
    height: 200,
    margin: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#999',
  },
  taskTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
  },
  taskTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;

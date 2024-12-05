import React from 'react';
import {StyleSheet, ScrollView, View, Text} from 'react-native';
import PieChart from 'react-native-pie-chart';
import * as Animatable from 'react-native-animatable';

interface Task {
  category: string;
  isCompleted: boolean;
}

interface Props {
  tasks?: Task[];
}

const CircularComponent = ({tasks = []}: Props) => {
  const categoryData = tasks.reduce((acc: {[key: string]: number}, task) => {
    if (!task.isCompleted) {
      const category = task.category || 'Khác';
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {});

  if (categoryData['Khác']) {
    const otherCount = categoryData['Khác'];
    delete categoryData['Khác'];
    categoryData['Khác'] = otherCount;
  }

  const series = Object.values(categoryData);

  const baseColors = [
    '#FF6384', // Red
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Green
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#E7E9ED', // Gray
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Green
    '#9966FF', // Purple
    '#FF9F40', // Orange
  ];

  const sliceColor = series.map(
    (_, index) => baseColors[index % baseColors.length],
  );

  const totalTasks = series.reduce((sum, value) => sum + value, 0);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {totalTasks > 0 ? (
          <Animatable.View animation="bounceIn" duration={1500}>
            <PieChart
              widthAndHeight={150}
              series={series}
              sliceColor={sliceColor}
              coverRadius={0.45}
              coverFill={'#FFF'}
            />
          </Animatable.View>
        ) : (
          <Text style={styles.noDataText}>
            Không có dữ liệu để hiển thị biểu đồ.
          </Text>
        )}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {Object.entries(categoryData).map(([category, count], index) => (
            <View key={category} style={styles.categoryRow}>
              <View
                style={[styles.colorBox, {backgroundColor: sliceColor[index]}]}
              />
              <Text
                style={styles.categoryText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {category}:
              </Text>
              <Text style={styles.countText}>{count}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default CircularComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Đặt vị trí biểu đồ và danh sách
    justifyContent: 'space-between',
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
  },
  scrollView: {
    marginLeft: 20,
    maxHeight: 200, // Giới hạn chiều cao để cuộn
  },
  scrollContent: {
    paddingBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  colorBox: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  categoryText: {
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1, // Chiếm tối đa không gian còn lại
  },
  countText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
});

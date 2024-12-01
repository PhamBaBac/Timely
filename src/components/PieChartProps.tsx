import React from 'react';
import {StyleSheet, ScrollView, View, Text, Dimensions} from 'react-native';
import PieChart from 'react-native-pie-chart';
import * as Animatable from 'react-native-animatable';
import {appColors} from '../constants';

interface PieChartProps {
  completedAheadOfSchedule: number;
  completedOnTime: number;
  incompleteTasks: number;
}

const TaskProgressPieChart: React.FC<PieChartProps> = ({
  completedAheadOfSchedule,
  completedOnTime,
  incompleteTasks,
}) => {
  const screenWidth = Dimensions.get('window').width;

  // Điều chỉnh kích thước và layout
  const chartSize = Math.min(screenWidth * 0.3, 130);
  const containerWidth = screenWidth * 0.9;

  const series = [
    completedAheadOfSchedule,
    completedOnTime,
    incompleteTasks,
  ].filter(value => value > 0);

  const baseColors = [
    appColors.primary, // Completed ahead of schedule
    '#5FD068', // Completed on time
    '#FF6B6B', // Incomplete tasks
  ];

  const sliceColor = series.map(
    (_, index) => baseColors[index % baseColors.length],
  );

  const labels = [
    'Hoàn thành trước hạn',
    'Hoàn thành đúng hạn',
    'Chưa hoàn thành',
  ].filter((_, index) => series[index] !== undefined);

  const totalTasks = series.reduce((sum, value) => sum + value, 0);

  return (
    <View style={[styles.container, {width: containerWidth}]}>
      <View style={styles.chartContainer}>
        {totalTasks > 0 ? (
          <Animatable.View
            animation="bounceIn"
            duration={1500}
            style={styles.pieChartWrapper}>
            <PieChart
              widthAndHeight={chartSize}
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {labels.map((label, index) => (
            <View key={label} style={styles.categoryRow}>
              <View
                style={[styles.colorBox, {backgroundColor: sliceColor[index]}]}
              />
              <View style={styles.labelContainer}>
                <Text
                  style={styles.categoryText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  ellipsizeMode="tail">
                  {label}
                </Text>
                <Text
                  style={styles.countText}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {series[index]}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginLeft: 10,
    maxHeight: 200,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'center',
    padding: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    fontWeight: 'bold',
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  countText: {
    fontSize: 12,
    color: '#555',
  },
});

export default TaskProgressPieChart;

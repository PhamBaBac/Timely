import React from 'react';
import {View, Text, Dimensions} from 'react-native';
import {PieChart} from 'react-native-chart-kit';

interface TaskCompletionChartProps {
  completedOnTime: number;
  overdueTasks: number;
  completedAheadOfSchedule: number;
}

const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({
  completedOnTime,
  overdueTasks,
  completedAheadOfSchedule,
}) => {
  const screenWidth = Dimensions.get('window').width;

  const data = [
    {
      name: 'Hoàn thành trước hạn',
      population: completedAheadOfSchedule,
      color: '#2196F3', // Blue for ahead of schedule tasks
      legendFontColor: '#7F7F7F',
      legendFontSize: 13,
    },
    {
      name: 'Hoàn thành đúng hạn',
      population: completedOnTime,
      color: '#4CAF50', // Green for on-time tasks
      legendFontColor: '#7F7F7F',
      legendFontSize: 13,
    },
    {
      name: 'Hoàn thành quá hạn',
      population: overdueTasks,
      color: '#FF5722', // Orange for overdue tasks
      legendFontColor: '#7F7F7F',
      legendFontSize: 13,
    },
  ];

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 10,
      }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 16,
        }}>
        Thống kê trạng thái công việc
      </Text>
      <PieChart
        data={data}
        width={screenWidth - 32}
        height={150}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="-30"
        center={[10, 0]}
        absolute
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          marginTop: 10,
        }}></View>
    </View>
  );
};

export default TaskCompletionChart;

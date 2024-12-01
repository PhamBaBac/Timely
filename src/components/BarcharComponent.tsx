import React from 'react';
import {Dimensions} from 'react-native';
import {BarChart} from 'react-native-chart-kit';
import {appColors} from '../constants';

interface BarChartComponentProps {
  tasks: any[];
  weekOffset: number;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  tasks,
  weekOffset,
}) => {
  const isWithinWeek = (date: number, offset: number) => {
    const taskDate = new Date(date);
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay() + 1 + offset * 7,
    );
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay() + 7 + offset * 7,
    );
    return taskDate >= start && taskDate <= end;
  };

  return (
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
  );
};

export default BarChartComponent;

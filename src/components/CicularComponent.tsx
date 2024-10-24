import React from 'react';
import {StyleSheet, ScrollView, View, Text} from 'react-native';
import PieChart from 'react-native-pie-chart';
import {appColors} from '../constants';
import RowComponent from './RowComponent';
import SpaceComponent from './SpaceComponent';

interface Task {
  category: string;
  isCompleted: boolean;
}

interface Props {
  tasks?: Task[]; // Đảm bảo tasks có thể undefined
}

const CicularComponent = ({tasks = []}: Props) => {
  // Nhóm tasks theo danh mục
  const categoryData = tasks.reduce((acc: {[key: string]: number}, task) => {
    if (!task.isCompleted) {
      const category = task.category || 'Không có danh mục';
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {});

  console.log('categoryData', categoryData);

  // Tạo một mảng chứa số lượng task cho mỗi danh mục
  const series = Object.values(categoryData);

  // Tạo mảng màu ngẫu nhiên không trùng nhau
  const generateShadeOfColor = (baseColor: string, factor: number) => {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));

    return `#${newR.toString(16).padStart(2, '0')}${newG
      .toString(16)
      .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const baseColor = '#5669FF';
  const sliceColor = series.map((_, index) =>
    generateShadeOfColor(baseColor, index / series.length),
  );

  // Kiểm tra nếu tổng của series bằng 0
  const totalTasks = series.reduce((sum, value) => sum + value, 0);

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {totalTasks > 0 ? (
          <PieChart
            widthAndHeight={150}
            series={series}
            sliceColor={sliceColor}
            coverRadius={0.45}
            coverFill={'#FFF'}
          />
        ) : (
          <Text>Không có dữ liệu để hiển thị biểu đồ.</Text>
        )}
        <SpaceComponent width={40} />
        <ScrollView>
          {Object.entries(categoryData).map(([category, count]) => (
            <View
              key={category}
              style={{
                flexDirection: 'row',
                marginVertical: 5,
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor:
                    sliceColor[Object.keys(categoryData).indexOf(category)],
                  marginRight: 10,
                }}
              />
              <Text
                style={{marginRight: 10, flexShrink: 1}}
                numberOfLines={1}
                ellipsizeMode="tail">
                {category}:
              </Text>
              <Text>{count}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default CicularComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: appColors.white,
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 16,
  },
});

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TaskModel} from '../models/taskModel';
import {
  Container,
  InputComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
  TitleComponent,
} from '../components';
import {SearchNormal1} from 'iconsax-react-native';
import {appColors} from '../constants';
import {replaceName} from '../utils/replaceName';
import useCustomStatusBar from '../hooks/useCustomStatusBar';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {format} from 'date-fns';

const ListTasks = ({navigation, route}: any) => {
  useCustomStatusBar('dark-content', appColors.lightPurple);

  const {tasks}: {tasks: TaskModel[]} = route.params;

  const [searchKey, setSearchKey] = useState('');
  const [results, setResults] = useState<TaskModel[]>([]);

  useEffect(() => {
    if (!searchKey) {
      setResults([]);
    } else {
      const items = tasks.filter(
        task =>
          (task.title &&
            task.title.toLowerCase().includes(searchKey.toLowerCase())) ||
          (task.category &&
            task.category.toLowerCase().includes(searchKey.toLowerCase())),
      );
      setResults(items);
    }
  }, [searchKey]);
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM');
  };
  const renderTask = (item: TaskModel) => (
    <SectionComponent key={item.id}>
      <Pressable
        onPress={() => navigation.navigate('TaskDetailsScreen', {id: item.id})}>
        <View
          style={[
            styles.taskItem,
            {
              borderLeftColor: item.isCompleted
                ? appColors.gray
                : appColors.primary,
            },
          ]}>
          <Pressable
            style={styles.roundButton}
            >
            {item.isCompleted ? (
              <MaterialIcons
                name="check-circle"
                size={24}
                color={appColors.gray}
              />
            ) : (
              <MaterialIcons
                name="radio-button-unchecked"
                size={24}
                color={appColors.primary}
              />
            )}
          </Pressable>
          <RowComponent>
            <View style={styles.taskContent}>
              <Text
                style={[
                  styles.taskTitle,
                  item.isCompleted && styles.completedTaskTitle,
                ]}>
                {item.title ? item.title : item.description}
              </Text>
              <Text style={styles.taskDate}>
                {item.dueDate
                  ? fomatDate(new Date(item.startDate || ''))
                  : 'No due date'}{' '}
                -{' '}
                {item.startTime ? formatTime(item.startTime) : 'No start time'}
              </Text>
            </View>
            <Pressable
              style={{
                paddingRight: 40,
              }}>
              <MaterialIcons
                name="star"
                size={24}
                color={item.isImportant ? appColors.yellow : appColors.gray2}
              />
            </Pressable>
          </RowComponent>
        </View>
      </Pressable>
    </SectionComponent>
  );

  return (
    <Container back title="Tìm kiếm công việc" >
      <SectionComponent>
        <InputComponent
          value={searchKey}
          onChange={val => setSearchKey(val)}
          allowClear
          prefix={<SearchNormal1 size={20} color={appColors.gray2} />}
          placeholder="Nhập title hoặc loại công việc"
        />
      </SectionComponent>
      <FlatList
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        data={searchKey ? results : [...tasks].sort((a, b) => {
          const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
          const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
          return dateB - dateA;
        })}
        ListEmptyComponent={
          <SectionComponent>
            <TextComponent text="Không tìm thấy công việc " styles={{
                textAlign:'center'
            }}/>
          </SectionComponent>
        }
        renderItem={({item}) => renderTask(item)}
      />
    </Container>
  );
};

export default ListTasks;
const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    borderLeftWidth: 2,
    borderLeftColor: appColors.primary,
  },
  roundButton: {
    marginRight: 10,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'column',
  },
  taskTitle: {
    fontSize: 16,
    color: appColors.black,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: appColors.gray,
  },
  taskDate: {
    fontSize: 14,
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

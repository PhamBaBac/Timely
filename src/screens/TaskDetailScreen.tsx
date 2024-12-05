import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, Share, TouchableOpacity, View} from 'react-native';
import auth, {firebase} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {format} from 'date-fns';
import {
  AddSquare,
  ArrowLeft2,
  CalendarEdit,
  ClipboardClose,
  Clock,
  Star1,
  StarSlash,
  TickCircle,
  MoreCircle,
} from 'iconsax-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {
  CardComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
  TitleComponent,
} from '../components';
import {appColors, fontFamilies} from '../constants';
import useCustomStatusBar from '../hooks/useCustomStatusBar';
import ModalAddSubTask from '../modal/ModalAddSubTask';
import {SubTask, TaskModel} from '../models/taskModel';
import {fetchTasks} from '../utils/taskUtil';
import {CategoryModel} from '../models/categoryModel';
import {ShareTaskAttributesModal} from '../components/ShareTaskAttributesModal';

const TaskDetailScreen = ({navigation, route}: any) => {
  useCustomStatusBar('light-content', appColors.primary);

  const id = route.params;

  const taskId = id.id;
  console.log('id', id);

  const [taskDetail, setTaskDetail] = useState<TaskModel>();
  console.log('taskDetail', taskDetail);
  const [progress, setProgress] = useState(0);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [isVisibleModalSubTask, setIsVisibleModalSubTask] = useState(false);
  const user = auth().currentUser;
  const [tasks, setTasks] = useState<TaskModel[]>([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const categoriesList = snapshot.docs.map(
          doc => doc.data() as CategoryModel,
        );
        setCategories(categoriesList);
      });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    getTaskDetail();
    getSubTaskById();
  }, [id]);

  useEffect(() => {
    if (subTasks.length > 0) {
      const completedPercent =
        subTasks.filter(element => element.isCompleted).length /
        subTasks.length;

      setProgress(completedPercent);
    }
  }, [subTasks]);

  const getTaskDetail = () => {
    firestore()
      .doc(`tasks/${taskId}`)
      .onSnapshot(snapshot => {
        setTaskDetail(snapshot.data() as TaskModel);
      });
  };

  const getSubTaskById = () => {
    firestore()
      .collection('subTasks')
      .where('taskId', '==', id)
      .onSnapshot(snap => {
        if (snap.empty) {
          setSubTasks([]);
        } else {
          const items: SubTask[] = [];
          snap.forEach((item: any) => {
            items.push({
              id: item.id,
              ...item.data(),
            });
          });
          setSubTasks(items);
        }
      });
  };

  const handleUpdateSubTask = async (id: string, isCompleted: boolean) => {
    try {
      await firestore()
        .doc(`subTasks/${id}`)
        .update({isCompleted: !isCompleted});
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteSubTask = async (id: string) => {
    try {
      await firestore().doc(`subTasks/${id}`).delete();
    } catch (error) {
      console.log(error);
    }
  };

  const getTaskTitleAndTime = () => {
    if (taskDetail) {
      const title = taskDetail.title;
      const startTime = taskDetail.startTime
        ? formatTime(new Date(taskDetail.startTime))
        : 'N/A';
      const startDate = taskDetail.startDate
        ? fomatDate(new Date(taskDetail.startDate))
        : 'N/A';
      //cong viec phu
      const subTask =
        subTasks.map((item, index) => {
          return {
            description: item.description,
          };
        }) || [];
      return {title, startTime, startDate, subTask};
    }
    return {title: 'N/A', startTime: 'N/A', startDate: 'N/A', subTask: []};
  };

  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('EditScreen', {task: task});
  };

  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  const onShare = () => {
    setIsShareModalVisible(true);
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  return taskDetail ? (
    <>
      <ScrollView style={{flex: 1, backgroundColor: appColors.white}}>
        <SectionComponent
          styles={{
            paddingBottom: 28,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            backgroundColor: appColors.primary,
          }}>
          <RowComponent
            styles={{alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft2
                size={28}
                color={appColors.white}
                style={{marginRight: 12}}
              />
            </TouchableOpacity>
            <TitleComponent
              line={1}
              flex={1}
              text={taskDetail.title}
              size={22}
              color={appColors.white}
            />
            <TouchableOpacity onPress={() => handleTaskPress(taskDetail)}>
              <MoreCircle size={28} color={appColors.white} variant="Bold" />
            </TouchableOpacity>
          </RowComponent>
          <View style={{marginTop: 20, marginHorizontal: 12}}>
            <RowComponent>
              <RowComponent
                styles={{
                  justifyContent: 'flex-start',
                }}>
                <Clock size={20} color={appColors.white} />
                <SpaceComponent width={4} />
                {taskDetail.startDate && taskDetail.startTime && (
                  <TextComponent
                    flex={0}
                    text={`${formatTime(new Date(taskDetail.startTime || ''))}`}
                    styles={{color: appColors.white}}
                  />
                )}
              </RowComponent>
              {taskDetail.dueDate && (
                <RowComponent
                  styles={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <CalendarEdit size={20} color={appColors.white} />
                  <SpaceComponent width={4} />

                  <TextComponent
                    flex={0}
                    text={fomatDate(new Date(taskDetail.startDate || '')) ?? ''}
                    styles={{color: appColors.white}}
                  />
                </RowComponent>
              )}
              {taskDetail.endDate && (
                <RowComponent
                  styles={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <CalendarEdit size={20} color={appColors.white} />
                  <SpaceComponent width={4} />

                  <TextComponent
                    flex={0}
                    text={fomatDate(new Date(taskDetail.endDate || '')) ?? ''}
                    styles={{color: appColors.white}}
                  />
                </RowComponent>
              )}
              <MaterialCommunityIcons
                name="share-variant"
                size={24}
                color={appColors.white}
                onPress={onShare}
              />
            </RowComponent>

            <ShareTaskAttributesModal
              visible={isShareModalVisible}
              task={taskDetail}
              onClose={() => setIsShareModalVisible(false)}
            />
          </View>
        </SectionComponent>

        <View style={{marginHorizontal: 10, marginVertical: 20}}>
          <SectionComponent>
            <TitleComponent text="Mô tả công việc" size={22} />
            <CardComponent
              bgColor={appColors.white}
              styles={{
                borderWidth: 1,
                borderColor: appColors.primary,
                borderRadius: 12,
                marginTop: 12,
              }}>
              <TextComponent
                text={taskDetail.description}
                styles={{textAlign: 'justify'}}
              />
            </CardComponent>
          </SectionComponent>
          <RowComponent
            styles={{
              marginHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: appColors.gray2,
            }}>
            <TitleComponent
              text={taskDetail.isImportant ? 'Quan trọng' : 'Không quan trọng'}
              size={22}
            />
            <SpaceComponent width={8} />

            <TouchableOpacity>
              {taskDetail.isImportant ? (
                <Star1 size={24} color="#FF8A65" />
              ) : (
                <StarSlash size={24} color="#FF8A65" />
              )}
            </TouchableOpacity>
          </RowComponent>

          <SpaceComponent height={12} />
          <RowComponent
            styles={{
              marginHorizontal: 16,
              // them border bottom
              borderBottomWidth: 1,
              borderBottomColor: appColors.gray2,
            }}>
            <TitleComponent text="Mức độ ưu tiên" size={22} />
            <SpaceComponent width={8} />

            <TextComponent
              text={
                taskDetail.priority === 'high'
                  ? 'Cao'
                  : taskDetail.priority === 'medium'
                  ? 'Trung bình'
                  : 'Thấp'
              }
              size={18}
              styles={{
                color: appColors.black,
              }}
            />
          </RowComponent>
          <SpaceComponent height={12} />
          <RowComponent
            styles={{
              marginHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: appColors.gray2,
            }}>
            <TitleComponent text="Loại công việc" size={22} />
            <SpaceComponent width={8} />

            <TouchableOpacity>
              <TextComponent
                text={taskDetail.category ? taskDetail.category : 'Khác'}
                size={18}
                styles={{
                  color: appColors.black,
                }}
              />
            </TouchableOpacity>
          </RowComponent>

          <SpaceComponent height={12} />
          <RowComponent
            styles={{
              marginHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: appColors.gray2,
            }}>
            <TitleComponent text="Lặp lại" size={22} />
            <SpaceComponent width={8} />

            <TouchableOpacity>
              <TextComponent
                text={
                  taskDetail.repeat === 'day'
                    ? 'Ngày'
                    : taskDetail.repeat === 'week'
                    ? 'Tuần'
                    : taskDetail.repeat === 'month'
                    ? 'Tháng'
                    : 'Không'
                }
                size={18}
                styles={{
                  color: appColors.black,
                }}
              />
            </TouchableOpacity>
          </RowComponent>

          <SpaceComponent height={12} />
          <SectionComponent>
            <RowComponent>
              <TitleComponent flex={1} text="Thêm nhiệm vụ phụ" size={20} />
              <TouchableOpacity
                onPress={() => {
                  setIsVisibleModalSubTask(true);
                }}>
                <AddSquare size={24} color={appColors.primary} variant="Bold" />
              </TouchableOpacity>
            </RowComponent>
            <SpaceComponent height={12} />
            {subTasks.length > 0 ? (
              subTasks.map((item, index) => (
                <CardComponent
                  key={`subtask${index}`}
                  styles={{marginBottom: 12}}>
                  <RowComponent>
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateSubTask(item.id, item.isCompleted)
                      }>
                      <TickCircle
                        variant={item.isCompleted ? 'Bold' : 'Outline'}
                        color={appColors.primary}
                        size={22}
                      />
                    </TouchableOpacity>
                    <View style={{flex: 1, marginLeft: 12}}>
                      <TextComponent text={item.description} />
                      <SpaceComponent height={4} />
                      <TextComponent
                        size={12}
                        text={fomatDate(new Date(item.createdAt || ''))}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteSubTask(item.id)}>
                      <ClipboardClose
                        size={24}
                        color={appColors.red}
                        variant="Bold"
                      />
                    </TouchableOpacity>
                  </RowComponent>
                </CardComponent>
              ))
            ) : (
              <TextComponent
                text="Không có nhiệm vụ phụ"
                styles={{
                  textAlign: 'center',
                  color: appColors.gray4,
                  fontFamily: fontFamilies.regular,
                  fontSize: 16,
                }}
              />
            )}
          </SectionComponent>
        </View>
      </ScrollView>

      <ModalAddSubTask
        visible={isVisibleModalSubTask}
        onClose={() => setIsVisibleModalSubTask(false)}
        taskId={id}
      />
    </>
  ) : (
    <></>
  );
};

export default TaskDetailScreen;

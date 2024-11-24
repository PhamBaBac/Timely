import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  Calendar as CalendarIcon,
  Category,
  Clock,
  Flag,
  Repeat,
  Star1,
  StarSlash,
} from 'iconsax-react-native';
import {format} from 'date-fns';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  ButtonComponent,
  Container,
  InputComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../components';
import {appColors} from '../constants';
import useCustomStatusBar from '../hooks/useCustomStatusBar';
import LoadingModal from '../modal/LoadingModal';
import ModalizeDate from '../modal/modalizaDate';
import ModalizeCategory from '../modal/ModalizeCategory';
import ModalizeRepeat from '../modal/ModalizeRepeat';
import ModalizeTime from '../modal/ModalizeTime';
import {CategoryModel} from '../models/categoryModel';
import {SubTask, TaskModel} from '../models/taskModel';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

const availableIcons = [
  'work',
  'cake',
  'sports-esports',
  'home',
  'school',
  'sports',
  'restaurant',
  'shopping-cart',
  'local-hospital',
  'directions-car',
  'flight',
  'beach-access',
];

const rainbowColors = [
  '#E57373',
  '#FFB74D',
  '#FFF176',
  '#81C784',
  '#64B5F6',
  '#9575CD',
  '#BA68C8',
];

const EditScreen = ({route, navigation}: any) => {
  const {task} = route.params;
  useCustomStatusBar('dark-content', appColors.lightPurple);

  const user = auth().currentUser;

  const [modalTimeVisible, setModalTimeVisible] = useState(false);
  const [modalDateVisible, setModalDateVisible] = useState(false);
  const [repeatModalVisible, setRepeatModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setNewCategoryModalVisible] =
    useState(false);

  const [selectedTime, setSelectedTime] = useState(new Date(task.startTime));
  const [selectedRepeat, setSelectedRepeat] = useState(
    task.repeat !== 'no' ? task.repeat : 'Không',
  );
  const [selectedCategory, setSelectedCategory] = useState(task.category);
  const [taskDetail, setTaskDetail] = useState<TaskModel>(task);
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(task.startDate),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(task.icon || 'work');
  const [selectedColor, setSelectedColor] = useState(
    task.color || appColors.primary,
  );
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [tempCategory, setTempCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(
    task.priority === 'low'
      ? 'Thấp'
      : task.priority === 'medium'
      ? 'Trung bình'
      : 'Cao',
  );

  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const modalizePriority = useRef<Modalize>(null);

  const id = task.id;

  const getSubTaskById = () => {
    firestore()
      .collection('subTasks')
      .where('taskId', '==', id)
      .onSnapshot(snap => {
        if (snap.empty) {
          setSubtasks([]);
        } else {
          const items: SubTask[] = [];
          snap.forEach((item: any) => {
            items.push({
              id: item.id,
              ...item.data(),
            });
          });
          setSubtasks(items);
        }
      });
  };

  const handleUpdateTask = async () => {
    if (!taskDetail || !taskDetail.title) {
      setErrorText('Tiêu đề là bắt buộc');
      return;
    }

    // Similar validation logic as in AddNewScreen
    // if (
    //   selectedDate &&
    //   selectedDate.toDateString() === new Date().toDateString() &&
    //   selectedTime < new Date()
    // ) {
    //   setErrorText('Giờ bắt đầu không thể là giờ trong quá khứ');
    //   return;
    // }

    // Prepare updated task data
    const updatedTask = {
      ...taskDetail,
      subtasks,
      category: selectedCategory,
      startDate: selectedDate.toISOString(),
      startTime: selectedTime.getTime(),
      updatedAt: Date.now(),
      repeat: selectedRepeat === 'Không' ? 'no' : taskDetail.repeat,
    };

    try {
      setIsLoading(true);
      await firestore().collection('tasks').doc(task.id).update(updatedTask);

      setIsLoading(false);
      navigation.navigate('Trang chủ', {
        screen: 'HomeScreen',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      setIsLoading(false);
      Alert.alert('Lỗi', 'Không thể cập nhật công việc');
    }
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].description = value;
    setSubtasks(updatedSubtasks);
  };

  const handleChangeValue = (
    id: string,
    value: string | Date | number | boolean,
  ) => {
    setTaskDetail(prevState => ({
      ...prevState!,
      [id]: value,
    }));
  };

  const handleNewCategoryCreate = async () => {
    try {
      setIsLoading(true);
      const categorySnapshot = await firestore()
        .collection('categories')
        .where('name', '==', tempCategory)
        .get();

      if (!tempCategory) {
        setIsLoading(false);
        return;
      }
      if (categories.some(category => category.name === tempCategory)) {
        setIsLoading(false);
        return;
      }
      if (!categorySnapshot.empty) {
        setIsLoading(false);
        setCategoryModalVisible(false);
        setNewCategoryModalVisible(false);
        return;
      }
      const categoryRef = firestore().collection('categories').doc();
      await categoryRef.set({
        uid: user?.uid,
        name: tempCategory,
        icon: selectedIcon,
        color: selectedColor,
      });
      setSelectedCategory(tempCategory);
      setNewCategoryModalVisible(false);
      setCategoryModalVisible(false);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to create new category.');
    }
  };

  // const handleChangeValue = (
  //   id: string,
  //   value: string | Date | number | number[] | boolean,
  // ) => {
  //   setTaskDetail(prevState => ({
  //     ...prevState,
  //     [id]: value,
  //   }));
  // };

  // const handleSubtaskChange = (index: number, value: string) => {
  //   const updatedSubtasks = [...subTasks];
  //   updatedSubtasks[index].description = value;
  //   setSubTasks(updatedSubtasks);
  // };

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
  }, []);

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <Container back title="Chỉnh sửa công việc" isScroll>
      <View style={styles.inputContainer}>
        <View
          style={{
            flexDirection: 'column',
          }}>
          <InputComponent
            value={taskDetail?.title || ''}
            onChange={val => handleChangeValue('title', val)}
            title="Tên công việc"
            allowClear
            placeholder="Nhập tên công việc"
          />
          <InputComponent
            value={taskDetail?.description || ''}
            onChange={val => handleChangeValue('description', val)}
            title="Mô tả công việc"
            allowClear
            placeholder="Nhập mô tả công việc"
            multiple
            numberOfLine={3}
          />
        </View>
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      {subtasks.map((subtask: SubTask, index: number) => (
        <TextInput
          key={index}
          style={styles.subtaskInput}
          placeholder={`Nhiệm vụ phụ ${index + 1}`}
          value={subtask.description}
          onChangeText={value => handleSubtaskChange(index, value)}
        />
      ))}
      <SpaceComponent height={20} />
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            setModalDateVisible(true);
            setSelectedDate(new Date());
          }}>
          <CalendarIcon size={24} color={appColors.primary} variant="Bold" />
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
            }}>
            <Text style={styles.optionText}>Chọn ngày bắt đầu </Text>

            <Text style={styles.selectedRepeatText}>
              {taskDetail?.startDate
                ? `${
                    selectedDate
                      ? fomatDate(selectedDate)
                      : taskDetail.repeatDays.length > 0 &&
                        selectedRepeat === 'Tuần'
                      ? fomatDate(
                          new Date(
                            Math.min(
                              ...taskDetail.repeatDays.map(day => {
                                const date = new Date();
                                date.setDate(
                                  date.getDate() +
                                    ((day + 7 - date.getDay()) % 7),
                                );
                                return date.getTime();
                              }),
                            ),
                          ),
                        )
                      : fomatDate(new Date())
                  }`
                : 'Chọn ngày/giờ'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setModalTimeVisible(true)}>
          <Clock size={24} color="#FF3399" variant="Bold" />
          <RowComponent>
            <Text style={styles.modalOptionText}>Chọn giờ bắt đầu</Text>
          </RowComponent>
          <Text style={[styles.selectedTimeText]}>
            {selectedTime
              ? selectedTime.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : null}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setCategoryModalVisible(true)}>
          <Category size={24} color="#9966FF" variant="Bold" />
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
            }}>
            <Text style={styles.optionText}>Chọn loại công việc</Text>
            <SpaceComponent width={10} />
            <Text
              style={styles.selectedTimeText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {selectedCategory}
            </Text>
          </View>
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}>
          {taskDetail?.isImportant ? (
            <Star1 size={24} color="#FF8A65" variant="Bold" />
          ) : (
            <StarSlash size={24} color="#FF8A65" variant="Bold" />
          )}
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
              alignItems: 'center', // Add this line to align items in the center
            }}>
            <Text style={styles.optionText}>Chọn quan trọng</Text>
            <SpaceComponent width={10} />
            <Switch
              trackColor={{false: appColors.gray, true: appColors.primary}}
              thumbColor={
                taskDetail?.isImportant ? appColors.primary : appColors.gray2
              }
              value={taskDetail?.isImportant ?? false}
              onValueChange={val => handleChangeValue('isImportant', val)}
            />
          </View>
        </View>
        <TouchableOpacity onPress={() => modalizePriority.current?.open()}>
          <View style={styles.option}>
            <Flag
              size="24"
              color={
                selectedPriority === 'Cao'
                  ? appColors.red
                  : selectedPriority === 'Trung bình'
                  ? appColors.yellow
                  : appColors.green
              }
              variant="Bold"
            />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.optionText}>Chọn mức độ ưu tiên</Text>
              <SpaceComponent width={10} />
              <Text
                style={styles.selectedTimeText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {selectedPriority}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <Portal>
          <Modalize
            adjustToContentHeight
            ref={modalizePriority}
            onClose={() => {}}>
            <View
              style={{
                padding: 20,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: appColors.text,
                  textAlign: 'center',
                  paddingBottom: 10,
                }}>
                Chọn mức độ ưu tiên
              </Text>
              <TouchableOpacity
                style={{
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                }}
                onPress={() => {
                  setSelectedPriority('Thấp');
                  handleChangeValue('priority', 'low');
                  modalizePriority.current?.close();
                }}>
                <RowComponent
                  styles={{
                    justifyContent: 'flex-start',
                    alignContent: 'center',
                  }}>
                  <Flag size="24" color={appColors.green} variant="Bold" />

                  <Text
                    style={{
                      fontSize: 16,
                      color: '#666',
                      paddingLeft: 10,
                    }}>
                    Thấp
                  </Text>
                </RowComponent>

                <SpaceComponent width={10} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                }}
                onPress={() => {
                  setSelectedPriority('Trung bình');
                  handleChangeValue('priority', 'medium');
                  modalizePriority.current?.close();
                }}>
                <RowComponent
                  styles={{
                    justifyContent: 'flex-start',
                    alignContent: 'center',
                  }}>
                  <Flag size="24" color={appColors.yellow} variant="Bold" />
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#666',
                      paddingLeft: 10,
                    }}>
                    Trung bình
                  </Text>
                </RowComponent>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingVertical: 15,
                }}
                onPress={() => {
                  setSelectedPriority('Cao');
                  handleChangeValue('priority', 'high');
                  modalizePriority.current?.close();
                }}>
                <RowComponent
                  styles={{
                    justifyContent: 'flex-start',
                    alignContent: 'center',
                  }}>
                  <Flag size="24" color={appColors.red} variant="Bold" />
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#666',
                      paddingLeft: 10,
                    }}>
                    Cao
                  </Text>
                </RowComponent>
              </TouchableOpacity>
            </View>
          </Modalize>
        </Portal>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setRepeatModalVisible(true)}>
          <Ionicons name="repeat" size={24} color={appColors.blue} />
          <Text style={styles.modalOptionText}>Chọn lặp lại</Text>
          <Text style={styles.selectedRepeatText}>
            {selectedRepeat ? selectedRepeat : 'Không'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ModalizeDate
          visible={modalDateVisible}
          onClose={() => setModalDateVisible(false)}
          selectedDate={selectedDate}
          onDateChange={date => {
            setSelectedDate(date);
            handleChangeValue('dueDate', date);
          }}
          taskDetail={taskDetail}
        />
      </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ModalizeRepeat
          visible={repeatModalVisible}
          onClose={() => setRepeatModalVisible(false)}
          taskDetail={taskDetail}
          handleChangeValue={handleChangeValue}
          setSelectedRepeat={setSelectedRepeat}
          startDate={selectedDate ? selectedDate : new Date()}
        />
      </View>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ModalizeCategory
          visible={categoryModalVisible}
          onClose={() => setCategoryModalVisible(false)}
          categories={categories}
          handleChangeValue={handleChangeValue}
          setSelectedCategory={setSelectedCategory}
          setNewCategoryModalVisible={setNewCategoryModalVisible}
          setTempCategory={setTempCategory}
          setSelectedColor={setSelectedColor}
          setSelectedIcon={setSelectedIcon}
          availableIcons={availableIcons}
        />
      </View>

      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ModalizeTime
          visible={modalTimeVisible}
          onClose={() => setModalTimeVisible(false)}
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
        />
      </View>
      <Modal
        transparent={true}
        visible={isNewCategoryModalVisible}
        animationType="slide"
        onRequestClose={() => setNewCategoryModalVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => setNewCategoryModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.newCategoryModalContent}>
                <View style={styles.newCategoryInputContainer}>
                  <TextInput
                    style={styles.newCategoryInput}
                    placeholder="Nhập tên danh mục mới"
                    value={tempCategory}
                    onChangeText={val => setTempCategory(val)}
                  />
                  <TouchableOpacity
                    style={styles.newCategoryAddButton}
                    onPress={() => {
                      handleNewCategoryCreate();
                      setNewCategoryModalVisible(false);
                    }}>
                    <MaterialIcons name="check" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <TextComponent text="Chọn màu" color={appColors.gray} />
                <SpaceComponent height={10} />
                <FlatList
                  data={rainbowColors}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  renderItem={({item}) => (
                    <View style={styles.colorOption}>
                      <TouchableOpacity
                        style={[
                          styles.colorButton,
                          {backgroundColor: item},
                          selectedColor === item && styles.selectedColorButton,
                        ]}
                        onPress={() => setSelectedColor(item)}
                      />
                    </View>
                  )}
                  showsHorizontalScrollIndicator={false}
                />
                <SpaceComponent height={20} />
                <TextComponent text="Chọn biểu tượng" color={appColors.gray} />
                <SpaceComponent height={10} />
                <FlatList
                  data={availableIcons}
                  keyExtractor={item => item}
                  numColumns={6}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.iconOption,
                        selectedIcon === item && styles.selectedIconOption,
                      ]}
                      onPress={() => setSelectedIcon(item)}>
                      <MaterialIcons
                        name={item}
                        size={18}
                        color={
                          selectedIcon === item
                            ? selectedColor
                            : appColors.gray2
                        }
                      />
                    </TouchableOpacity>
                  )}
                  columnWrapperStyle={{
                    justifyContent: 'space-between',
                    paddingVertical: 5,
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <SpaceComponent height={20} />
      <SectionComponent>
        <ButtonComponent text="Lưu" onPress={handleUpdateTask} type="primary" />
      </SectionComponent>
      <LoadingModal visible={isLoading} />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'column',

    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: appColors.gray2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: appColors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  subtaskInput: {
    height: 40,
    borderColor: appColors.gray2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
    fontSize: 14,
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: appColors.black,
    fontWeight: 'bold',
  },
  selectedCategoryText: {
    marginLeft: 10,
    fontSize: 16,
    color: appColors.black,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    paddingBottom: 80,
    alignItems: 'center',
  },
  calendar: {
    width: '100%',
    height: 350,
    marginBottom: 20,
  },
  modalOptions: {
    width: '80%',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  modalOptionText: {
    marginLeft: 8,
    fontSize: 16,
    color: appColors.black,
    fontWeight: 'bold',
  },
  selectedTimeText: {
    marginLeft: 'auto',
    fontSize: 16,
    flexShrink: 1,
  },
  repeatModalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    paddingBottom: 80,
  },
  repeatOptionText: {
    fontSize: 16,
    color: appColors.text,
    marginVertical: 10,
    justifyContent: 'flex-start',
  },
  selectedRepeatText: {
    marginLeft: 'auto',
    fontSize: 16,
    color: appColors.gray,
  },
  categoryModalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    paddingBottom: 80,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  categoryOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: appColors.black,
  },
  newCategoryModalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
  },
  newCategoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  newCategoryInput: {
    flex: 1,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginRight: 10,
  },
  newCategoryAddButton: {
    backgroundColor: appColors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  selectedColorButton: {
    borderWidth: 2,
    borderColor: 'white',
  },
  iconOption: {
    width: '12%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 100,
  },
  selectedIconOption: {
    borderColor: appColors.primary,
  },
});

export default EditScreen;
function setProgress(completedPercent: number) {
  throw new Error('Function not implemented.');
}
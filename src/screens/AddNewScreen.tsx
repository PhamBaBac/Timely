import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  Calendar as CalendarIcon,
  Clock,
  Repeat,
  Tag,
} from 'iconsax-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TextInputComponent,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import { format } from 'date-fns';
import { Modalize } from 'react-native-modalize';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  ButtonComponent,
  Container,
  InputComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent
} from '../components';
import { appColors } from '../constants';
import LoadingModal from '../modal/LoadingModal';
import ModalizeDate from '../modal/modalizaDate';
import ModalizeCategory from '../modal/ModalizeCategory';
import ModalizeRepeat from '../modal/ModalizeRepeat';
import ModalizeTime from '../modal/ModalizeTime';
import { CategoryModel } from '../models/categoryModel';
import { TaskModel } from '../models/taskModel';

const now = new Date();
const initValue: TaskModel = {
  id: '',
  uid: '',
  title: '',
  description: '',
  dueDate: new Date(),
  startTime: new Date(),
  remind: '',
  repeat: 'no' as 'no' | 'day' | 'week' | 'month',
  category: '',
  isCompleted: false,
  isImportant: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const availableIcons = [
  'work',
  'celebration',
  'sports-esports',
  'home',
  'school',
  'fitness-center',
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

const AddNewScreen = ({navigation}: any) => {
  const user = auth().currentUser;
  const [modalTimeVisible, setModalTimeVisible] = useState(false);
  const [modalDateVisible, setModalDateVisible] = useState(false);
  const [repeatModalVisible, setRepeatModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setNewCategoryModalVisible] =
    useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  console.log(selectedTime);
  const [selectedRepeat, setSelectedRepeat] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [taskDetail, setTaskDetail] = useState<TaskModel>(initValue);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0]);
  const [selectedColor, setSelectedColor] = useState(appColors.primary);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [tempCategory, setTempCategory] = useState('');
  const [subtasks, setSubtasks] = useState<
    {description: string; isCompleted: boolean}[]
  >([]); // Updated state for subtasks
  useEffect(() => {
    user && setTaskDetail({...taskDetail, uid: user.uid});
  }, [user]);

  const handleAddNewTask = async () => {
    if (!taskDetail.description) {
      setErrorText('Description is required');
      return;
    }

    const startDate = taskDetail.dueDate
      ? new Date(taskDetail.dueDate)
      : new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setErrorText('Due date cannot be in the past');
      return;
    }

    const data = {
      ...taskDetail,
      uid: user?.uid, // Ensure uid is included
      subtasks, // Include subtasks in the task data
      repeat: selectedRepeat === 'Không' ? 'no' : taskDetail.repeat, 
    };

    const taskRef = firestore().collection('tasks').doc();
    const task = {
      ...data,
      id: taskRef.id,
      category: selectedCategory,
      startDate: startDate.toISOString(),
      startTime: selectedTime.getTime(),
    };

    setIsLoading(true);
    await taskRef
      .set(task)
      .then(() => {
        console.log('New task added with repeat information!!');
        setIsLoading(false);
        setTaskDetail(initValue);
        setSubtasks([]);
        setErrorText('');
        navigation.navigate('Trang chủ', {
          screen: 'HomeScreen',
        });
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
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

  const handleChangeValue = (id: string, value: string | Date) => {
    setTaskDetail(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].description = value;
    setSubtasks(updatedSubtasks);
  };

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
    return format(date, 'dd/MM');
  };

  return (
    <Container back title="Thêm nhiệm vụ mới" isScroll>
      <View style={styles.inputContainer}>
        <View
          style={{
            flexDirection: 'column',
          }}>
          <InputComponent
            value={taskDetail.title}
            onChange={val => handleChangeValue('title', val)}
            title="tiêu đề"
            allowClear
            placeholder="nhập tiêu đề"
          />
          <InputComponent
            value={taskDetail.description}
            onChange={val => handleChangeValue('description', val)}
            title="Nội dung"
            allowClear
            placeholder="Nhập nội dung"
            multiple
            numberOfLine={3}
          />
        </View>
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      {subtasks.map((subtask, index) => (
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
            setSelectedRepeat('');
          }}>
          <CalendarIcon size={24} color={appColors.primary} />
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
            }}>
            <Text style={styles.optionText}>Chọn ngày bắt đầu </Text>

            <Text style={styles.selectedRepeatText}>
              {taskDetail.dueDate
                ? `${
                    selectedDate
                      ? fomatDate(selectedDate)
                      : fomatDate(new Date())
                  }`
                : 'Chọn ngày/giờ'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setModalTimeVisible(true)}>
          <Clock size={24} color={appColors.primary} />
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
          <Tag size={24} color={appColors.primary} />
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
        <TouchableOpacity
          style={styles.option}
          onPress={() => setRepeatModalVisible(true)}>
          <Repeat size={24} color={appColors.primary} />
          <Text style={styles.modalOptionText}>Chọn lặp lại</Text>
          <Text style={styles.selectedRepeatText}>{selectedRepeat}</Text>
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
        <ButtonComponent
          text="Thêm công việc"
          onPress={handleAddNewTask}
          type='primary'
        />
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
    color: appColors.primary,
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
    marginLeft: 10,
    fontSize: 16,
    color: appColors.primary,
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

export default AddNewScreen;

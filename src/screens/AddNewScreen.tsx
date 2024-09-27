import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  Calendar as CalendarIcon,
  Clock,
  Repeat,
  Share,
  Tag,
} from 'iconsax-react-native';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Calendar as RNCalendar} from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  ButtonComponent,
  CategoryOption,
  InputComponent,
  SpaceComponent,
  TextComponent,
} from '../components';
import {appColors} from '../constants';
import LoadingModal from '../modal/LoadingModal';
import {TaskModel} from '../models/taskModel';
import {CategoryModel} from '../models/categoryModel';

const now = new Date();
const initValue: TaskModel = {
  id: '',
  uid: '',
  description: '',
  dueDate: new Date(),
  startTime: new Date(),
  remind: '',
  repeat: 'day' || 'week' || 'month',
  category: '',
  isCompleted: false,
  isImportant: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  subtasks: [],
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

const AddNewScreen = () => {
  const user = auth().currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isRepeatModalVisible, setRepeatModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setNewCategoryModalVisible] =
    useState(false);
  const [selectedTime, setSelectedTime] = useState('');
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
  const [subtasks, setSubtasks] = useState<string[]>([]); // New state for subtasks

  useEffect(() => {
    user && setTaskDetail({...taskDetail, uid: user.uid});
  }, [user]);

  const handleAddNewTask = async () => {
    if (!taskDetail.description) {
      setErrorText('Description is required');
      return;
    }

    const data = {
      ...taskDetail,
      subtasks, // Include subtasks in the task data
    };

    const repeat = taskDetail.repeat;
    const startDate = taskDetail.dueDate
      ? new Date(taskDetail.dueDate)
      : new Date();

    const taskRef = firestore().collection('tasks').doc();
    const task = {
      ...data,
      id: taskRef.id,
      category: taskDetail.category,
      repeat,
      startDate: startDate.toISOString(),
      startTime: taskDetail.startTime?.getTime(),
    };
    setIsLoading(true);
    await taskRef
      .set(task)
      .then(() => {
        console.log('New task added with repeat information!!');
        setIsLoading(false);
        setTaskDetail(initValue);
        setSubtasks([]); // Reset subtasks
        setErrorText('');
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const handleOutsidePress = () => {
    setModalVisible(false);
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
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

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = value;
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

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên công việc"
          value={taskDetail.description}
          onChangeText={val => handleChangeValue('description', val)}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            handleAddNewTask();
            setSelectedCategory('');
          }}>
          <MaterialIcons name="check" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      {/* Subtasks Section */}
      {subtasks.map((subtask, index) => (
        <TextInput
          key={index}
          style={styles.subtaskInput}
          placeholder={`Nhiệm vụ phụ ${index + 1}`}
          value={subtask}
          onChangeText={value => handleSubtaskChange(index, value)}
        />
      ))}

      <SpaceComponent height={20} />

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            setModalVisible(true);
            setSelectedDate(new Date());
            setSelectedTime('');
            setSelectedRepeat('');
          }}>
          <CalendarIcon size={24} color={appColors.primary} />
          <Text style={styles.optionText}>Lịch </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setCategoryModalVisible(true)}>
          <Tag size={24} color={appColors.primary} />
          <Text style={styles.optionText}>Danh mục</Text>
          <Text style={styles.selectedCategoryText}>{selectedCategory}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleAddSubtask}>
          <MaterialIcons
            name="playlist-add"
            size={24}
            color={appColors.primary}
          />
          <Text style={styles.optionText}>Thêm nhiệm vụ phụ</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <RNCalendar
                  value={taskDetail.dueDate}
                  style={styles.calendar}
                  markingType={'custom'}
                  markedDates={{
                    [new Date().toISOString().split('T')[0]]: {
                      marked: true,
                      dotColor: appColors.primary,
                      customStyles: {
                        text: {
                          color: appColors.primary,
                          fontWeight: 'bold',
                        },
                      },
                    },
                    [selectedDate
                      ? selectedDate.toISOString().split('T')[0]
                      : '']: {
                      selected: true,
                      textColor: appColors.primary,
                      selectedColor: appColors.primary,
                    },
                  }}
                  onDayPress={({dateString}: {dateString: string}) => {
                    const selectedDate = new Date(dateString);
                    setSelectedDate(selectedDate);
                    handleChangeValue('dueDate', selectedDate);
                  }}
                  renderArrow={(direction: 'left' | 'right') => (
                    <MaterialIcons
                      name={
                        direction === 'left'
                          ? 'arrow-back-ios'
                          : 'arrow-forward-ios'
                      }
                      size={14}
                      color={appColors.primary}
                    />
                  )}
                />

                <View style={styles.modalOptions}>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={showTimePicker}>
                    <Clock size={24} color={appColors.primary} />
                    <Text style={styles.modalOptionText}>Chọn thời gian</Text>
                    <Text style={styles.selectedTimeText}>{selectedTime}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => setRepeatModalVisible(true)}>
                    <Repeat size={24} color={appColors.primary} />
                    <Text style={styles.modalOptionText}>Chọn lặp lại</Text>
                    <Text style={styles.selectedRepeatText}>
                      {selectedRepeat}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={isRepeatModalVisible}
        animationType="slide"
        onRequestClose={() => setRepeatModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setRepeatModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.repeatModalContent}>
                <Text
                  style={styles.repeatOptionText}
                  onPress={() => {
                    handleChangeValue('repeat', 'day');
                    setRepeatModalVisible(false);
                    setSelectedRepeat('Ngày');
                  }}>
                  Lặp lại mỗi ngày
                </Text>
                <Text
                  style={styles.repeatOptionText}
                  onPress={() => {
                    handleChangeValue('repeat', 'week');
                    setRepeatModalVisible(false);
                    setSelectedRepeat('Tuần');
                  }}>
                  Lặp lại mỗi tuần
                </Text>
                <Text
                  style={styles.repeatOptionText}
                  onPress={() => {
                    handleChangeValue('repeat', 'month');
                    setRepeatModalVisible(false);
                    setSelectedRepeat('Tháng');
                  }}>
                  Lặp lại mỗi tháng
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        transparent={true}
        visible={isCategoryModalVisible}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => setCategoryModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.categoryModalContent}>
                <TouchableOpacity
                  style={styles.categoryOption}
                  onPress={() => {
                    handleChangeValue('category', 'Công việc');
                    setSelectedCategory('Công việc');
                    setCategoryModalVisible(false);
                  }}>
                  <MaterialIcons
                    name="work"
                    size={24}
                    color={appColors.primary}
                  />
                  <Text style={styles.categoryOptionText}>Công việc</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.categoryOption}
                  onPress={() => {
                    handleChangeValue('category', 'Sinh nhật');
                    setSelectedCategory('Sinh nhật');
                    setCategoryModalVisible(false);
                  }}>
                  <MaterialIcons
                    name="celebration"
                    size={24}
                    color={appColors.primary}
                  />
                  <Text style={styles.categoryOptionText}>Sinh nhật</Text>
                </TouchableOpacity>
                <FlatList
                  data={categories}
                  keyExtractor={item => item.name}
                  renderItem={({item}) => (
                    <CategoryOption
                      name={item.name}
                      icon={item.icon}
                      color={item.color}
                      onPress={() => {
                        handleChangeValue('category', item.name);
                        setSelectedCategory(item.name);
                        setCategoryModalVisible(false);
                      }}
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.categoryOption}
                  onPress={() => {
                    setNewCategoryModalVisible(true);
                    setCategoryModalVisible(false);
                    setTempCategory('');
                    setSelectedColor(appColors.primary);
                    setSelectedIcon(availableIcons[0]);
                  }}>
                  <MaterialIcons
                    name="add-box"
                    size={24}
                    color={appColors.primary}
                  />
                  <Text style={styles.categoryOptionText}>
                    Tạo danh mục mới
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
                          selectedIcon === item ? selectedColor : appColors.gray
                        }
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={time => {
          setSelectedTime(
            time.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          );
          handleChangeValue('startTime', time);
          hideTimePicker();
        }}
        onCancel={hideTimePicker}
      />
      <LoadingModal visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  calendar: {
    width: '100%',
    height: 350,
    marginBottom: 20,
  },
  modalOptions: {
    width: '100%',
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
    color: appColors.gray,
  },
  repeatModalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  repeatOptionText: {
    fontSize: 16,
    color: appColors.primary,
    marginVertical: 10,
  },
  selectedRepeatText: {
    marginLeft: 'auto',
    fontSize: 16,
    color: appColors.gray,
  },
  categoryModalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
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
    width: '16.66%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
  },
  selectedIconOption: {
    borderColor: appColors.primary,
  },
});

export default AddNewScreen;

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  Calendar as CalendarIcon,
  Clock,
  Repeat,
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
import {CategoryOption, SpaceComponent, TextComponent} from '../components';
import {appColors} from '../constants';
import LoadingModal from '../modal/LoadingModal';
import {CategoryModel} from '../models/categoryModel';
import {TaskModel} from '../models/taskModel';
import {DateModal} from '../components/DateModal';
import {RepeatModal} from '../components/RepeatModal';
import {CategoryModal} from '../components/CategoryModal';
import {NewCategoryModal} from '../components/NewCategoryModal';
import {TimeModal} from '../components/TimeModal';

const now = new Date();
const initValue: TaskModel = {
  id: '',
  uid: '',
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

const AddNewScreen = ({navigation}: any) => {
  const user = auth().currentUser;
  const [isDateModalVisible, setDateModalVisible] = useState(false);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [isRepeatModalVisible, setRepeatModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setNewCategoryModalVisible] =
    useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedRepeat, setSelectedRepeat] = useState('Không');
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
  >([]);

  useEffect(() => {
    user && setTaskDetail({...taskDetail, uid: user.uid});
  }, [user]);

  const handleAddNewTask = async () => {
    if (!taskDetail.description) {
      setErrorText('Vui lòng nhập tên công việc');
      return;
    }

    const startDate = taskDetail.dueDate
      ? new Date(taskDetail.dueDate)
      : new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setErrorText('Ngày bắt đầu không hợp lệ');
      return;
    }

    const data = {
      ...taskDetail,
      uid: user?.uid,
      subtasks,
      repeat: selectedRepeat === 'Không' ? 'no' : taskDetail.repeat,
    };

    const taskRef = firestore().collection('tasks').doc();
    const task = {
      ...data,
      id: taskRef.id,
      category: selectedCategory,
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

  const handleChangeValue = (id: string, value: string | Date) => {
    setTaskDetail(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleAddSubtask = () => {
    const hasEmptySubtask = subtasks.some(
      subtask => subtask.description === '' && subtask.isCompleted === false,
    );
    if (!hasEmptySubtask) {
      setSubtasks([...subtasks, {description: '', isCompleted: false}]);
    }
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].description = value;
    setSubtasks(updatedSubtasks);
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

  const handleDateSelection = (date: any) => {
    setSelectedDate(new Date(date.dateString));
    handleChangeValue('dueDate', new Date(date.dateString));
    setDateModalVisible(false);
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
          onPress={() => setDateModalVisible(true)}>
          <CalendarIcon size={24} color={appColors.primary} />
          <Text style={styles.optionText}>Chọn ngày bắt đầu</Text>
          <Text style={styles.selectedDateText}>
            {selectedDate ? selectedDate.toLocaleDateString() : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setTimeModalVisible(true)}>
          <Clock size={24} color={appColors.primary} />
          <Text style={styles.optionText}>Chọn giờ bắt đầu</Text>
          <Text style={styles.selectedTimeText}>{selectedTime}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setRepeatModalVisible(true)}>
          <Repeat size={24} color={appColors.primary} />
          <Text style={styles.optionText}>Chọn lặp lại</Text>
          <Text style={styles.selectedRepeatText}>{selectedRepeat}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setCategoryModalVisible(true)}>
          <Tag size={24} color={appColors.primary} />
          <Text style={styles.optionText}>Chọn loại công việc</Text>
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

      {/* Date Selection Modal */}
      <DateModal
        isVisible={isDateModalVisible}
        onClose={() => setDateModalVisible(false)}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelection}
      />

      {/* Repeat Selection Modal */}
      <RepeatModal
        isVisible={isRepeatModalVisible}
        onClose={() => setRepeatModalVisible(false)}
        onSelectRepeat={(repeat, label) => {
          handleChangeValue('repeat', repeat);
          setRepeatModalVisible(false);
          setSelectedRepeat(label);
        }}
      />

      {/* Time Selection Modal */}
      <TimeModal
        isVisible={isTimeModalVisible}
        onClose={() => setTimeModalVisible(false)}
        onTimeSelect={time => {
          setSelectedTime(
            time.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          );
          handleChangeValue('startTime', time);
          setTimeModalVisible(false);
        }}
      />

      {/* Repeat Selection Modal */}

      {/* Category Selection Modal */}
      {/* Category Selection Modal */}
      <CategoryModal
        isVisible={isCategoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        categories={categories}
        onSelectCategory={category => {
          handleChangeValue('category', category);
          setSelectedCategory(category);
          setCategoryModalVisible(false);
        }}
        onNewCategory={() => {
          setNewCategoryModalVisible(true);
          setCategoryModalVisible(false);
          setTempCategory('');
          setSelectedColor(appColors.primary);
          setSelectedIcon(availableIcons[0]);
        }}
      />

      {/* New Category Modal */}

      {/* New Category Modal */}
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
                    placeholder="Nhập tên loại công việc mới"
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
  selectedDateText: {
    marginLeft: 'auto',
    fontSize: 16,
    color: appColors.gray,
  },
  selectedTimeText: {
    marginLeft: 'auto',
    fontSize: 16,
    color: appColors.gray,
  },
  selectedRepeatText: {
    marginLeft: 'auto',
    fontSize: 16,
    color: appColors.gray,
  },
  selectedCategoryText: {
    marginLeft: 'auto',
    fontSize: 16,
    color: appColors.gray,
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
  },
  repeatModalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
  },
  repeatOptionText: {
    fontSize: 16,
    color: appColors.primary,
    marginVertical: 10,
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

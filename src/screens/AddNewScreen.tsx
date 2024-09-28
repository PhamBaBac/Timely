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
  repeat: 'no' || 'day' || 'week' || 'month',
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
const AddNewScreen = () => {
  const user = auth().currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isRepeatModalVisible, setRepeatModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setNewCategoryModalVisible] =
    useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedRepeat, setSelectedRepeat] = useState('Không');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [taskDetail, setTaskDetail] = useState<TaskModel>(initValue);
  console.log('selectedRepeat', selectedRepeat);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0]); // Default to the first icon
  const [selectedColor, setSelectedColor] = useState(appColors.primary);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [tempCategory, setTempCategory] = useState('');

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

  // Check if dueDate is before the current date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for comparison

  if (startDate < today) {
    setErrorText('Due date cannot be in the past');
    return;
  }

  const data = {
    ...taskDetail,
    repeat: selectedRepeat === 'Không' ? 'no' : taskDetail.repeat, // Set to 'no' if no repeat selected
  };

  const taskRef = firestore().collection('tasks').doc();
  const task = {
    ...data,
    id: taskRef.id,
    category: taskDetail.category,
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

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories') // Change the collection to 'categories'
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const categoriesList = snapshot.docs.map(
          doc => doc.data() as CategoryModel,
        ); // Update the type to 'Category'
        setCategories(categoriesList); // Update the state setter to 'setCategories'
      });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}>
        <TextInput
          style={{
            flex: 1,
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
            padding: 10,
          }}
          placeholder="Nhập tên công việc"
          value={taskDetail.description}
          onChangeText={val => handleChangeValue('description', val)}
        />
        <TouchableOpacity
          style={{
            backgroundColor: appColors.primary,
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 10,
          }}
          onPress={() => {
            handleAddNewTask();
            setSelectedCategory('');
          }}>
          <MaterialIcons name="check" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      {errorText ? <Text style={{color: 'red'}}>{errorText}</Text> : null}
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
        <TouchableOpacity style={styles.option}>
          <Share size={24} color={appColors.primary} />
          <Text style={styles.optionText}>Chia sẻ</Text>
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
                    handleChangeValue('repeat', 'no');
                    setRepeatModalVisible(false);
                    setSelectedRepeat('Không');
                  }}>
                  Không lặp lại
                </Text>
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
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: '80%',
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}>
                  <TextInput
                    style={{
                      flex: 1,
                      borderBottomWidth: 1,
                      borderBottomColor: '#ccc',
                      padding: 10,
                    }}
                    placeholder="Nhập tên danh mục mới"
                    value={tempCategory}
                    onChangeText={val => setTempCategory(val)}
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: appColors.primary,
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: 10,
                    }}
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
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 24,
                        backgroundColor:
                          selectedColor === item ? item : 'transparent',
                        margin: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <TouchableOpacity
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 20,
                          backgroundColor: item,
                          borderWidth: selectedColor === item ? 2 : 0,
                          borderColor: 'white',
                        }}
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
                  numColumns={6} // Set the number of columns to 6
                  key={`flatlist-${6}`} // Add a dynamic key prop
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={{
                        width: 32,
                        height: 32,
                        margin: 4,
                        padding: 4,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor:
                          selectedIcon === item
                            ? selectedColor
                            : appColors.gray,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
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
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: appColors.gray2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
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
    marginLeft: 100,
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
    marginLeft: 100,
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
  button: {
    backgroundColor: appColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  iconOption: {
    flex: 1, // Make the icon option take up equal space
    margin: 5,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center', // Center the icon horizontally
  },
  selectedIconOption: {
    borderColor: 'blue',
  },
});

export default AddNewScreen;

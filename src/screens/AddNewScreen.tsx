import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {
  Calendar as CalendarIcon,
  Category,
  Clock,
  Flag,
  Notification,
  Repeat,
  Sort,
  Star1,
  StarSlash,
  Tag,
  TickSquare,
} from 'iconsax-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';

import {format, set} from 'date-fns';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
import {TaskModel} from '../models/taskModel';

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
  repeatDays: [],
  repeatCount: 0,
  category: '',
  isCompleted: false,
  isImportant: false,
  priority: 'low' as 'low' | 'medium' | 'high',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

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

const AddNewScreen = ({navigation}: any) => {
  useCustomStatusBar('dark-content', appColors.lightPurple);
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  const fomatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };
  const user = auth().currentUser;
  const [modalTimeVisible, setModalTimeVisible] = useState(false);
  const [modalDateVisible, setModalDateVisible] = useState(false);
  const [repeatModalVisible, setRepeatModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setNewCategoryModalVisible] =
    useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedRepeat, setSelectedRepeat] = useState('');
  //mac dinh la 5 phut
  const [selectedRemind, setSelectedRemind] = useState('5 phút');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [taskDetail, setTaskDetail] = useState<TaskModel>(initValue);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0]);
  const [selectedColor, setSelectedColor] = useState(appColors.primary);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [tempCategory, setTempCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const modalizePriority = useRef<Modalize>(null);
  const modalizeRemind = useRef<Modalize>(null);

 // Updated state for subtasks
  useEffect(() => {
    user && setTaskDetail({...taskDetail, uid: user.uid});
  }, [user]);

  const handleAddNewTask = async () => {
    if (!taskDetail.title) {
      setErrorText('Tiêu đề là bắt buộc');
      return;
    }

    //rang buoc gio bat dau phai lon hon gio hien tai
    if (
      selectedDate &&
      selectedDate.toDateString() === new Date().toDateString() &&
      selectedTime < new Date()
    ) {
      setErrorText('Giờ bắt đầu không thể là giờ trong quá khứ');
      return;
    }
    //rang buoc ngay bat dau phai lon hon hoac bang nga hien tai
    if (
      selectedDate &&
      selectedDate <= new Date(new Date().setHours(0, 0, 0, 0))
    ) {
      setErrorText('Ngày bắt đầu không thể là ngày trong quá khứ');
      return;
    }

    let startDate = selectedDate ? new Date(selectedDate) : new Date();

    // Weekly repeat logic
    if (taskDetail.repeat === 'week' && taskDetail.repeatDays.length > 0) {
      const currentDay = startDate.getDay(); // Get the current day based on selected start date
      const sortedRepeatDays = [
        ...taskDetail.repeatDays.filter(day => day >= currentDay),
        ...taskDetail.repeatDays.filter(day => day < currentDay),
      ];

      const nextRepeatDay = sortedRepeatDays[0];
      startDate.setDate(
        startDate.getDate() +
          (nextRepeatDay - currentDay + (nextRepeatDay < currentDay ? 7 : 0)),
      );
    }

    // Monthly repeat logic
    else if (
      taskDetail.repeat === 'month' &&
      taskDetail.repeatDays.length > 0
    ) {
      const currentDay = startDate.getDate();
      const sortedRepeatDays = [
        ...taskDetail.repeatDays.filter(day => day >= currentDay),
        ...taskDetail.repeatDays.filter(day => day < currentDay),
      ];

      let nextRepeatDay = sortedRepeatDays[0]; // Get the first valid repeat day

      if (nextRepeatDay < currentDay) {
        startDate.setMonth(startDate.getMonth() + 1); // Move to next month
      }

      startDate.setDate(nextRepeatDay);

      if (startDate.getDate() !== nextRepeatDay) {
        startDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0,
        );
      }
    } else if (
      (taskDetail.repeat === 'week' || taskDetail.repeat === 'month') &&
      taskDetail.repeatDays.length === 0
    ) {
      startDate = selectedDate ? new Date(selectedDate) : new Date();
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate <= today) {
      setErrorText('Ngày đến hạn không thể là ngày trong quá khứ');
      return;
    }

    const data = {
      ...taskDetail,
      uid: user?.uid,
      repeat: selectedRepeat === 'Không' ? 'no' : taskDetail.repeat,
    };

    const taskRef = firestore().collection('tasks').doc();
    const task = {
      ...data,
      id: taskRef.id,
      category: selectedCategory,
      startDate: startDate.toISOString(),
      startTime: selectedTime.getTime(),
      endDate: taskDetail.endDate ? taskDetail.endDate.toISOString() : null,
    };

    await taskRef
      .set(task)
      .then(() => {
        console.log('New task added with repeat information!!');
        setIsLoading(false);
        setTaskDetail(initValue);
        setSelectedRepeat('');
        setSelectedDate(null);
        setSelectedRemind('5 phút');
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

  const handleChangeValue = (
    id: string,
    value: string | Date | number | number[] | boolean,
  ) => {
    setTaskDetail(prevState => ({
      ...prevState,
      [id]: value,
       remind: '5',
    }));
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
    <Container back title="Thêm công việc mới" isScroll>
      <View style={styles.inputContainer}>
        <View
          style={{
            flexDirection: 'column',
          }}>
          <InputComponent
            value={taskDetail.title}
            onChange={val => handleChangeValue('title', val)}
            title="Tên công việc"
            allowClear
            placeholder="Nhập tên công việc"
          />
          <InputComponent
            value={taskDetail.description}
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
              {taskDetail.dueDate
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
          {taskDetail.isImportant ? (
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
                taskDetail.isImportant ? appColors.primary : appColors.gray2
              }
              value={taskDetail.isImportant}
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
        <TouchableOpacity onPress={() => modalizeRemind.current?.open()}>
          <View style={styles.option}>
            <Notification size="24" color="red" variant="Bold" />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.optionText}>Chọn lời nhắc</Text>
              <SpaceComponent width={10} />
              <Text
                style={styles.selectedTimeText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {selectedRemind}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <Portal>
          <Modalize
            adjustToContentHeight
            ref={modalizeRemind}
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
                Nhắc nhở trước khi hết hạn
              </Text>
              <TouchableOpacity
                style={{
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                }}
                onPress={() => {
                  setSelectedRemind('5 phút');
                  handleChangeValue('remind', '5');
                  modalizeRemind.current?.close();
                }}>
                <RowComponent
                  styles={{
                    justifyContent: 'flex-start',
                    alignContent: 'center',
                  }}>
                  <Clock size="24" color={appColors.green} variant="Bold" />

                  <Text
                    style={{
                      fontSize: 16,
                      color: '#666',
                      paddingLeft: 10,
                    }}>
                    5 phút
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
                  setSelectedRemind('15 phút');
                  handleChangeValue('remind', '15');
                  modalizeRemind.current?.close();
                }}>
                <RowComponent
                  styles={{
                    justifyContent: 'flex-start',
                    alignContent: 'center',
                  }}>
                  <Clock size="24" color={appColors.yellow} variant="Bold" />
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#666',
                      paddingLeft: 10,
                    }}>
                    15 phút
                  </Text>
                </RowComponent>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingVertical: 15,
                }}
                onPress={() => {
                  setSelectedRemind('30 phút');
                  handleChangeValue('remind', '30');
                  modalizeRemind.current?.close();
                }}>
                <RowComponent
                  styles={{
                    justifyContent: 'flex-start',
                    alignContent: 'center',
                  }}>
                  <Clock size="24" color={appColors.red} variant="Bold" />
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#666',
                      paddingLeft: 10,
                    }}>
                    30 phút
                  </Text>
                </RowComponent>
              </TouchableOpacity>
            </View>
          </Modalize>
        </Portal>
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
          selectedDate={selectedDate}
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
          type="primary"
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

export default AddNewScreen;

import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  Button,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  ButtonComponent,
  Container,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector, useDispatch} from 'react-redux';
import {appColors} from '../../constants';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import {CardEdit, Flag, Trash} from 'iconsax-react-native';
import {CategoryModel} from '../../models/categoryModel';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {TaskModel} from '../../models/taskModel';
import {fetchTasks} from '../../utils/taskUtil';

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
const CategoryScreen = () => {
  const user = auth().currentUser;

  const modalizePriority = React.useRef<Modalize>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedIdCategory, setSelectedIdCategory] =
    React.useState<string>('');
  console.log('selectedCategory', selectedCategory);
  const [isNewCategoryModalVisible, setNewCategoryModalVisible] =
    useState(false);
  const [selectedColor, setSelectedColor] = useState(appColors.primary);
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0]);

  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const categoryNames = categories.map(cat => cat.name);
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const categoriesList = snapshot.docs.map(doc => ({
          id: doc.id, // Lấy docId từ tài liệu Firestore
          ...doc.data(),
        })) as CategoryModel[];
        setCategories(categoriesList);
      });
    return () => unsubscribe();
  }, [user]);

  //Liet ke so Task cua moi Category
  const [tasks, setTasks] = useState<TaskModel[]>([]);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = fetchTasks(user.uid, setTasks);

      // Cleanup on unmount
      return () => unsubscribe();
    }
  }, [user?.uid]);

  const categoryData = tasks.reduce((acc: {[key: string]: number}, task) => {
    if (task.category) {
      acc[task.category] = (acc[task.category] || 0) + 1;
    }
    return acc;
  }, {} as {[key: string]: number});
  const handleCategoryUpdate = async () => {
    try {
      const category = categories.find(cat => cat.id === selectedIdCategory);
      if (!category || !category.id) {
        Alert.alert('Thông báo', 'Danh mục không tồn tại');
        return;
      }

      if (
        categoryNames.includes(selectedCategory) &&
        category.icon === selectedIcon &&
        category.color === selectedColor
      ) {
        Alert.alert('Thông báo', 'Danh mục đã tồn tại');
        return;
      }

      const batch = firestore().batch();

      // 1. Cập nhật danh mục trong collection `categories`
      const categoryRef = firestore().collection('categories').doc(category.id);
      batch.update(categoryRef, {
        name: selectedCategory,
        color: selectedColor,
        icon: selectedIcon,
      });

      // 2. Lấy tất cả các task liên quan trong collection `tasks`
      const tasksSnapshot = await firestore()
        .collection('tasks')
        .where('category', '==', category.name)
        .get();

      // 3. Cập nhật từng task với thông tin danh mục mới
      tasksSnapshot.forEach(doc => {
        const taskRef = firestore().collection('tasks').doc(doc.id);
        batch.update(taskRef, {
          category: selectedCategory, // Cập nhật tên danh mục mới
        });
      });

      // 4. Thực hiện batch update
      await batch.commit();
      console.log('Cập nhật danh mục và các task liên quan thành công!');
    } catch (error) {
      console.error('Error updating category and tasks: ', error);
    }
  };

  const handleAddNewCategory = async () => {
    try {
      if (!selectedCategory) {
        Alert.alert('Thông báo', 'Vui lòng nhập tên danh mục');
        return;
      }

      if (categoryNames.includes(selectedCategory)) {
        Alert.alert('Thông báo', 'Danh mục đã tồn tại');
        return;
      }

      await firestore().collection('categories').add({
        uid: user?.uid,
        name: selectedCategory,
        color: selectedColor,
        icon: selectedIcon,
      });

      console.log('Thêm danh mục thành công!');
      setNewCategoryModalVisible(false);
    } catch (error) {
      console.error('Error adding new category: ', error);
    }

  }

  const handleDeleteCategoryAndTasks = async (categoryId: string) => {
    try {
      //Xac nhan truoc khi xoa
      Alert.alert(
        'Xác nhận xóa',
        'Bạn có chắc chắn muốn xóa loại công việc này?',
        [
          {text: 'Hủy', style: 'cancel'},
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              const batch = firestore().batch();

              // 1. Xóa danh mục trong collection `categories`
              const categoryRef = firestore()
                .collection('categories')
                .doc(categoryId);
              batch.delete(categoryRef);

              // 2. Xóa tất cả các task liên quan trong collection `tasks`
              const tasksSnapshot = await firestore()
                .collection('tasks')
                .where(
                  'category',
                  '==',
                  categories.find(cat => cat.id === categoryId)?.name,
                )
                .get();

              tasksSnapshot.forEach(doc => {
                const taskRef = firestore().collection('tasks').doc(doc.id);
                batch.delete(taskRef);
              });

              // 3. Thực hiện batch delete
              await batch.commit();
              console.log('Xóa danh mục và các task liên quan thành công!');
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error deleting category and tasks: ', error);
    }
  };

  return (
    <Container back title="Quản lý loại công việc">
      {categories.map(category => {
        return (
          <RowComponent
            key={category.name}
            styles={{
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}>
            <RowComponent
              styles={{
                alignItems: 'center',
              }}>
              <MaterialIcons
                name={category.icon}
                size={24}
                color={
                  category.color === 'default'
                    ? appColors.primary
                    : category.color
                }
              />
              <Text
                style={{
                  marginLeft: 16,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                {category.name}
              </Text>
            </RowComponent>
            <RowComponent
              styles={{
                alignItems: 'center',
              }}>
              <Text
                style={{
                  marginRight: 16,
                  fontSize: 16,
                  color: appColors.gray,
                }}>
                {categoryData[category.name] || 0}
              </Text>
              <Pressable
                onPress={() => {
                  setSelectedIdCategory(category.id);
                  modalizePriority.current?.open();
                }}>
                <MaterialIcons
                  name="more-vert"
                  size={24}
                  color={appColors.gray}
                />
              </Pressable>
            </RowComponent>
          </RowComponent>
        );
      })}
      <SpaceComponent height={20} />
      <ButtonComponent
        text="Thêm loại công việc"
        type='primary'
        onPress={() => setNewCategoryModalVisible(true)}
      />
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
              Loại công việc
            </Text>
            <Pressable
              style={{
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
              }}
              onPress={() => {
                console.log('selectedIdCategory', selectedIdCategory);
                if (selectedIdCategory) {
                  const category = categories.find(
                    cat => cat.id === selectedIdCategory,
                  );
                  console.log('category', category);
                  if (category) {
                    setSelectedCategory(category.name); // Lưu tên danh mục
                    setSelectedColor(category.color); // Lưu màu của danh mục
                    setSelectedIcon(category.icon); // Lưu icon của danh mục
                    setNewCategoryModalVisible(true);
                  }
                }
                modalizePriority.current?.close();
              }}>
              <RowComponent
                styles={{
                  justifyContent: 'flex-start',
                  alignContent: 'center',
                }}>
                <CardEdit size="24" color={appColors.green} />
                <Text
                  style={{
                    fontSize: 16,
                    color: '#666',
                    paddingLeft: 10,
                  }}>
                  Sửa
                </Text>
              </RowComponent>
              <SpaceComponent width={10} />
            </Pressable>
            <TouchableOpacity
              style={{
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
              }}
              onPress={() => {
                if (selectedIdCategory) {
                  handleDeleteCategoryAndTasks(selectedIdCategory);
                }
                modalizePriority.current?.close();
              }}>
              <RowComponent
                styles={{
                  justifyContent: 'flex-start',
                  alignContent: 'center',
                }}>
                <Trash size="24" color={appColors.red} />
                <Text
                  style={{
                    fontSize: 16,
                    color: '#666',
                    paddingLeft: 10,
                  }}>
                  Xóa
                </Text>
              </RowComponent>
            </TouchableOpacity>
          </View>
        </Modalize>
      </Portal>
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
                    value={selectedCategory || ''}
                    onChangeText={val => setSelectedCategory(val)}
                  />
                  <TouchableOpacity
                    style={styles.newCategoryAddButton}
                    onPress={() => {
                      setNewCategoryModalVisible(false);
                      if (selectedIdCategory) {
                        handleCategoryUpdate();
                        setSelectedIdCategory('');
                      } else {
                        handleAddNewCategory();
                      }
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
                        selectedIcon === item && {
                          borderColor: selectedColor,
                        },
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
        {/* Button Tao cong viec */}
      </Modal>
    </Container>
  );
};

export default CategoryScreen;
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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

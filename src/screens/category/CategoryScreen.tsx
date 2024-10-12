import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import {Container} from '../../components';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../../constants';
import firestore from '@react-native-firebase/firestore';

const defaultCategories = [
  {
    name: 'Công việc',
    color: 'default',
    icon: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    name: 'Cá nhân',
    color: 'default',
    icon: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    name: 'Gia đình',
    color: 'default',
    icon: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const CategoryScreen = () => {
  const [categories, setCategories] = useState<
    {
      id: string;
      name: string;
      count: number;
      color: string;
      icon: string;
      createdAt: number;
      updatedAt: number;
    }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
    color: string;
    icon: string;
    createdAt: number;
    updatedAt: number;
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({top: 0, right: 0});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    color: string;
    icon: string;
    createdAt: number;
    updatedAt: number;
  }>({
    id: '',
    name: '',
    color: '',
    icon: '',
    createdAt: 0,
    updatedAt: 0,
  });
  const [isDefaultColor, setIsDefaultColor] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('categories')
      .onSnapshot(async snapshot => {
        const categoriesList = await Promise.all(
          snapshot.docs.map(async doc => {
            const categoryData = doc.data();
            const tasksSnapshot = await firestore()
              .collection('tasks')
              .where('category', '==', categoryData.name)
              .get();
            return {
              id: doc.id,
              name: categoryData.name,
              count: tasksSnapshot.size,
              color: categoryData.color || 'default',
              icon: categoryData.icon || '',
              createdAt: categoryData.createdAt || 0,
              updatedAt: categoryData.updatedAt || 0,
            };
          }),
        );
        setCategories(categoriesList);
      });

    // Add default categories if they don't exist
    defaultCategories.forEach(async defaultCategory => {
      const categorySnapshot = await firestore()
        .collection('categories')
        .where('name', '==', defaultCategory.name)
        .get();
      if (categorySnapshot.empty) {
        await firestore().collection('categories').add(defaultCategory);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (category: {
    id: string;
    name: string;
    color: string;
    icon: string;
    createdAt: number;
    updatedAt: number;
  }) => {
    setEditingCategory(category);
    setIsDefaultColor(category.color === 'default');
    setIsCreating(false);
    setEditModalVisible(true);
    hideModal();
  };

  const handleCreate = () => {
    setEditingCategory({
      id: '',
      name: '',
      color: '',
      icon: '',
      createdAt: 0,
      updatedAt: 0,
    });
    setIsDefaultColor(true);
    setIsCreating(true);
    setEditModalVisible(true);
  };

  const handleDelete = (category: {
    id: string;
    name: string;
    color: string;
    icon: string;
    createdAt: number;
    updatedAt: number;
  }) => {
    Alert.alert(
      'Xóa Loại Công Việc',
      `Bạn có chắc chắn muốn xóa loại công việc: ${category.name}?`,
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore()
                .collection('categories')
                .doc(category.id)
                .delete();
              Alert.alert('Thành công', 'Đã xóa loại công việc thành công');
              hideModal();
            } catch (error) {
              Alert.alert(
                'Lỗi',
                'Không thể xóa loại công việc. Vui lòng thử lại sau.',
              );
            }
          },
        },
      ],
    );
  };

  const showModal = (
    category: {
      id: string;
      name: string;
      color: string;
      icon: string;
      createdAt: number;
      updatedAt: number;
    },
    event: any,
  ) => {
    const {pageY, pageX} = event.nativeEvent;
    setModalPosition({top: pageY, right: pageX});
    setSelectedCategory(category);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const saveCategory = async () => {
    try {
      if (isCreating) {
        await firestore()
          .collection('categories')
          .add({
            name: editingCategory.name,
            color: isDefaultColor ? 'default' : editingCategory.color,
          });
        Alert.alert('Thành công', 'Đã tạo loại công việc mới thành công');
      } else {
        await firestore()
          .collection('categories')
          .doc(editingCategory.id)
          .update({
            name: editingCategory.name,
            color: isDefaultColor ? 'default' : editingCategory.color,
          });
        Alert.alert('Thành công', 'Đã cập nhật loại công việc thành công');
      }
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        `Không thể ${
          isCreating ? 'tạo' : 'cập nhật'
        } loại công việc. Vui lòng thử lại sau.`,
      );
    }
  };

  return (
    <Container back title="Quản lý loại công việc">
      <StatusBar barStyle="dark-content" backgroundColor={appColors.white} />
      <ScrollView style={styles.container}>
        {categories.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
              <Icon
                name="radio-button-checked"
                size={24}
                color={
                  category.color === 'default'
                    ? appColors.primary
                    : category.color
                }
              />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <View style={styles.categoryRight}>
              <Text style={styles.categoryCount}>{category.count}</Text>
              <TouchableOpacity onPress={event => showModal(category, event)}>
                <Icon name="more-vert" size={24} color={appColors.gray} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Icon name="add" size={24} color={appColors.primary} />
          <Text style={styles.addButtonText}>Tạo mới</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>Nhấn và kéo để sắp xếp lại</Text>
      </ScrollView>

      {modalVisible && (
        <Animated.View
          style={[
            styles.modalContainer,
            {
              top: modalPosition.top - 40,
              right: 20,
              opacity: fadeAnim,
            },
          ]}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => selectedCategory && handleEdit(selectedCategory)}>
            <Text style={styles.modalButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => selectedCategory && handleDelete(selectedCategory)}>
            <Text style={styles.modalButtonText}>Xóa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={hideModal}>
            <Text style={styles.modalButtonText}>Hủy</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={styles.editModalTitle}>
              {isCreating
                ? 'Tạo loại công việc mới'
                : 'Chỉnh sửa loại công việc'}
            </Text>
            <TextInput
              style={styles.input}
              value={editingCategory.name}
              onChangeText={text =>
                setEditingCategory({...editingCategory, name: text})
              }
              placeholder="Tên loại công việc"
              maxLength={50}
            />
            <Text style={styles.editModalSubtitle}>
              {editingCategory.name.length}/50
            </Text>
            <View style={styles.colorOption}>
              <Text>Màu sắc danh mục</Text>
              <View style={styles.colorSwitch}>
                <Text>Mặc định</Text>
                <Switch
                  value={isDefaultColor}
                  onValueChange={setIsDefaultColor}
                />
              </View>
            </View>
            <View style={styles.editModalButtons}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButton}>HỦY</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCategory}>
                <Text style={styles.saveButton}>LƯU</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.white,
  },
  header: {
    fontSize: 14,
    color: appColors.gray,
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: 'bold', // Make the category name bold
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCount: {
    marginRight: 16,
    fontSize: 16,
    color: appColors.gray,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  addButtonText: {
    marginLeft: 16,
    fontSize: 16,
    color: appColors.primary,
  },
  footer: {
    fontSize: 14,
    color: appColors.gray,
    textAlign: 'center',
    padding: 16,
  },
  modalContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalButtonText: {
    fontSize: 14,
    color: appColors.primary,
  },
  editModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  editModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
    marginBottom: 5,
  },
  editModalSubtitle: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  colorOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  colorSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    color: appColors.primary,
    marginRight: 20,
  },
  saveButton: {
    color: appColors.primary,
    fontWeight: 'bold',
  },
});

export default CategoryScreen;

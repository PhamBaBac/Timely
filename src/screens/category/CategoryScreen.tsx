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
} from 'react-native';
import React, {useState} from 'react';
import {
  Container,
  RowComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../redux/store';
import {appColors} from '../../constants';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import {CardEdit, Flag, Trash} from 'iconsax-react-native';
import {handleDeleteCategory, handleUpdateCategory} from '../../utils/taskUtil';
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
  const dispatch = useDispatch();
  const modalizePriority = React.useRef<Modalize>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string>(
    '',
  );
  const [isNewCategoryModalVisible, setNewCategoryModalVisible] =
    useState(false);
    console.log('isNewCategoryModalVisible', isNewCategoryModalVisible);
  const [selectedColor, setSelectedColor] = useState(appColors.primary);
  console.log('selectedColor', selectedColor);
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0]);
  console.log('selectedIcon', selectedIcon);
  const [oldCategory, setOldCategory] = useState<string >('');


  const categories = useSelector(
    (state: RootState) => state.categories.categories,
  );

  const tasks = useSelector((state: RootState) => state.tasks.tasks);


  const categoryData = tasks.reduce((acc: {[key: string]: number}, task) => {
    // Count tasks by category
    if (acc[task.category]) {
      acc[task.category]++;
    } else {
      acc[task.category] = 1;
    }
    return acc;
  }, {});

  const handleDeleteCategoryAndTasks = (category: string) => {
    handleDeleteCategory(category, tasks, dispatch);
  };

  const handleCategoryUpdate = (
    oldCategory: string,
    newCategory: string,
    newIcon: string,
    newColor: string,
  ) => {
    handleUpdateCategory(
      oldCategory,
      newCategory,
      newIcon,
      newColor,
      tasks,
      dispatch,
    );
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
                  setSelectedCategory(category.name);
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
                if (selectedCategory) {
                  const category = categories.find(
                    cat => cat.name === selectedCategory,
                  );
                  if (category) {
                    setOldCategory(category.name);
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
                if (selectedCategory) {
                  handleDeleteCategoryAndTasks(selectedCategory);
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
                      handleCategoryUpdate(
                        oldCategory,
                        selectedCategory ,
                        selectedIcon,
                        selectedColor,
                      );
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

import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Calendar as RNCalendar} from 'react-native-calendars';
import {appColors} from '../constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CategoryOption from './CategoryOption';
import {CategoryModel} from '../models/categoryModel';

interface CategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  categories: CategoryModel[];
  onSelectCategory: (category: string) => void;
  onNewCategory: () => void;
}

export const CategoryModal = ({
  isVisible,
  onClose,
  categories,
  onSelectCategory,
  onNewCategory,
}: CategoryModalProps) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.categoryModalContent}>
              <TouchableOpacity
                style={styles.categoryOption}
                onPress={() => onSelectCategory('Công việc')}>
                <MaterialIcons
                  name="work"
                  size={24}
                  color={appColors.primary}
                />
                <Text style={styles.categoryOptionText}>Công việc</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.categoryOption}
                onPress={() => onSelectCategory('Cá nhân')}>
                <MaterialIcons
                  name="person"
                  size={24}
                  color={appColors.primary}
                />
                <Text style={styles.categoryOptionText}>Cá nhân</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.categoryOption}
                onPress={() => onSelectCategory('Gia đình')}>
                <MaterialIcons
                  name="family-restroom"
                  size={24}
                  color={appColors.primary}
                />
                <Text style={styles.categoryOptionText}>Gia đình</Text>
              </TouchableOpacity>
              <FlatList
                data={categories}
                keyExtractor={item => item.name}
                renderItem={({item}) => (
                  <CategoryOption
                    name={item.name}
                    icon={item.icon}
                    color={item.color}
                    onPress={() => onSelectCategory(item.name)}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.categoryOption}
                onPress={onNewCategory}>
                <MaterialIcons
                  name="add-box"
                  size={24}
                  color={appColors.primary}
                />
                <Text style={styles.categoryOptionText}>
                  Tạo loại công việc mới
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

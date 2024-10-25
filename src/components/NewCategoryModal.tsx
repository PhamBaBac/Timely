import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {Calendar as RNCalendar} from 'react-native-calendars';
import {appColors} from '../constants';

// Define the availableIcons array
const availableIcons = [
  'home',
  'work',
  'school',
  'fitness-center',
  'shopping-cart',
  'restaurant',
  'local-cafe',
  'directions-car',
  'flight',
  'hotel',
  'local-hospital',
  'local-library',
  'local-movies',
  'local-offer',
  'local-parking',
  'local-pharmacy',
  'local-pizza',
  'local-play',
  'local-post-office',
  'local-printshop',
  'local-see',
  'local-shipping',
  'local-taxi',
];
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TextComponent from './TextComponent';
import SpaceComponent from './SpaceComponent';

// Define the rainbowColors array
const rainbowColors = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#8B00FF', // Violet
];

interface NewCategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  tempCategory: string;
  selectedColor: string;
  selectedIcon: string;
  onCategoryNameChange: (name: string) => void;
  onColorSelect: (color: string) => void;
  onIconSelect: (icon: string) => void;
  onSubmit: () => void;
}

export const NewCategoryModal = ({
  isVisible,
  onClose,
  tempCategory,
  selectedColor,
  selectedIcon,
  onCategoryNameChange,
  onColorSelect,
  onIconSelect,
  onSubmit,
}: NewCategoryModalProps) => {
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.newCategoryModalContent}>
              <View style={styles.newCategoryInputContainer}>
                <TextInput
                  style={styles.newCategoryInput}
                  placeholder="Nhập tên loại công việc mới"
                  value={tempCategory}
                  onChangeText={onCategoryNameChange}
                />
                <TouchableOpacity
                  style={styles.newCategoryAddButton}
                  onPress={onSubmit}>
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
                      onPress={() => onColorSelect(item)}
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
                    onPress={() => onIconSelect(item)}>
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

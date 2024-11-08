// src/components/ModalizeCategory.tsx
import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import { CategoryOption, TextComponent } from '../components';
import { appColors } from '../constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ModalizeCategoryProps {
  visible: boolean;
  onClose: () => void;
  categories: Array<{name: string; icon: string; color: string}>;
  handleChangeValue: (key: string, value: any) => void;
  setSelectedCategory: (value: string) => void;
  setNewCategoryModalVisible: (visible: boolean) => void;
  setTempCategory: (value: string) => void;
  setSelectedColor: (color: string) => void;
  setSelectedIcon: (icon: string) => void;
  availableIcons: string[];
}

const ModalizeCategory: React.FC<ModalizeCategoryProps> = ({
  visible,
  onClose,
  categories,
  handleChangeValue,
  setSelectedCategory,
  setNewCategoryModalVisible,
  setTempCategory,
  setSelectedColor,
  setSelectedIcon,
  availableIcons,
}) => {
  const modalizeRef = useRef<Modalize>(null);

  useEffect(() => {
    if (visible) {
      modalizeRef.current?.open();
    } else {
      modalizeRef.current?.close();
    }
  }, [visible]);

  return (
    <Portal>
      <Modalize ref={modalizeRef} adjustToContentHeight onClosed={onClose}>
        <View style={styles.categoryModalContent}>
          <TextComponent
            text="Chọn loại công việc"
            color={appColors.text}
            styles={{
              fontSize: 20,
              fontWeight: 'bold',
              color: appColors.text,
              textAlign: 'center',
              paddingBottom: 10,
            }}
          />
          <TouchableOpacity
            style={styles.categoryOption}
            onPress={() => {
              handleChangeValue('category', 'Du lịch');
              setSelectedCategory('Du lịch');
              modalizeRef.current?.close();
            }}>
            <MaterialIcons name="work" size={24} color={appColors.green} />
            <Text style={styles.categoryOptionText}>Du lịch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.categoryOption}
            onPress={() => {
              handleChangeValue('category', 'Sinh nhật');
              setSelectedCategory('Sinh nhật');
              modalizeRef.current?.close();
            }}>
            <MaterialIcons
              name="celebration"
              size={24}
              color={appColors.yellow}
            />
            <Text style={styles.categoryOptionText}>Sinh nhật</Text>
          </TouchableOpacity>
          <ScrollView>
            {categories.map(item => (
              <CategoryOption
                key={item.name}
                name={item.name}
                icon={item.icon}
                color={item.color}
                onPress={() => {
                  handleChangeValue('category', item.name);
                  setSelectedCategory(item.name);
                  modalizeRef.current?.close();
                }}
              />
            ))}
            <TouchableOpacity
              style={styles.categoryOption}
              onPress={() => {
                setNewCategoryModalVisible(true);
                modalizeRef.current?.close();
                setTempCategory('');
                setSelectedColor(appColors.primary);
                setSelectedIcon(availableIcons[0]);
              }}>
              <MaterialIcons
                name="add-box"
                size={24}
                color={appColors.primary}
              />
              <Text style={styles.categoryOptionText}>Tạo danh mục mới</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modalize>
    </Portal>
  );
};

const styles = StyleSheet.create({
  categoryModalContent: {
    padding: 20,
    paddingBottom: 80,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  categoryOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: appColors.text,
  },
});

export default ModalizeCategory;

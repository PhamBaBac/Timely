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
import {CategoryOption, RowComponent, SpaceComponent, TextComponent} from '../components';
import {appColors} from '../constants';
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
  closeOnOverlayTap?: boolean;
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
  closeOnOverlayTap = false,
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
      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        onClosed={onClose}
        closeOnOverlayTap={closeOnOverlayTap}>
        <View style={styles.categoryModalContent}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: appColors.text,
                textAlign: 'center',
                flex: 1,
              }}>
              Chọn loại công việc
            </Text>
            <MaterialIcons
              name="cancel"
              size={30}
              color={appColors.red}
              onPress={onClose}
            />
          </View>

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
                  onClose();
                }}
              />
            ))}
            <TouchableOpacity
              style={styles.categoryOption}
              onPress={() => {
                setNewCategoryModalVisible(true);
                setTempCategory('');
                setSelectedColor(appColors.primary);
                setSelectedIcon(availableIcons[0]);
                onClose();
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
    paddingBottom: 80,
    paddingHorizontal: 10,
    paddingTop: 10,
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

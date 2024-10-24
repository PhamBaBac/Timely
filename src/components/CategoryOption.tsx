import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { appColors } from '../constants';
interface CategoryOptionProps {
  name: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const CategoryOption = (props: CategoryOptionProps) => {
  const {name, icon, color, onPress} = props;

  return (
    <TouchableOpacity
      style={[styles.categoryOption, {borderColor: color}]}
      onPress={onPress}>
      <MaterialIcons name={icon} size={24} color={color} />
      <Text style={[styles.categoryOptionText,]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  categoryOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: appColors.black,
  },
});

export default CategoryOption;

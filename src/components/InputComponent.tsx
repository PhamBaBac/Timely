import React, {ReactNode, useState} from 'react';
import {
  KeyboardTypeOptions,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {globalStyles} from '../styles/globalStyles';
import {Eye, EyeSlash} from 'iconsax-react-native';
import TitleComponent from './TitleComponent';
import RowComponent from './RowComponent';
import { appColors } from '../constants';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  title?: string;
  prefix?: ReactNode;
  affix?: ReactNode;
  allowClear?: boolean;
  multiple?: boolean;
  numberOfLine?: number;
  type?: KeyboardTypeOptions;
  isPassword?: boolean;
  color?: string;

}

const InputComponent = (props: Props) => {
  const {
    value,
    onChange,
    placeholder,
    title,
    prefix,
    affix,
    allowClear,
    multiple,
    numberOfLine,
    isPassword,
    type,
    color,
  } = props;
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={{marginBottom: 16}}>
      {title && <TitleComponent text={title} flex={0} />}
      <RowComponent
        styles={[
          globalStyles.inputContainer,
          {
            marginTop: title ? 8 : 0,
            minHeight: multiple && numberOfLine ? 32 * numberOfLine : 54,
            paddingVertical: 4,
            paddingHorizontal: 10,
            backgroundColor: color ?? appColors.white,
            borderColor: appColors.gray2,
            borderWidth: 1,
          },
        ]}>
        {prefix && prefix}
        <View
          style={{
            flex: 1,
            paddingLeft: prefix ? 8 : 0,
            paddingRight: affix ? 8 : 0,
          }}>
          <TextInput
            style={[
              globalStyles.text,
              {margin: 0, padding: 0, paddingVertical: 6, flex: 1},
            ]}
            placeholder={placeholder ?? ''}
            placeholderTextColor={'#676767'}
            value={value}
            onChangeText={val => onChange(val)}
            multiline={multiple}
            numberOfLines={numberOfLine}
            secureTextEntry={isPassword ? !showPass : false}
            keyboardType={type}
          />
        </View>
        {affix && affix}

        {allowClear && value && (
          <TouchableOpacity onPress={() => onChange('')}>
            <AntDesign name="close" size={20} color={appColors.white} />
          </TouchableOpacity>
        )}

        {isPassword && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            {showPass ? (
              <Eye size={20} color={appColors.gray} />
            ) : (
              <EyeSlash size={20} color={appColors.gray} />
            )}
          </TouchableOpacity>
        )}
      </RowComponent>
    </View>
  );
};

export default InputComponent;

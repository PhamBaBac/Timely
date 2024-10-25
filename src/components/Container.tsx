import {ArrowLeft, ArrowLeft2} from 'iconsax-react-native';
import React, {ReactNode} from 'react';
import {SafeAreaView, ScrollView, TouchableOpacity, View} from 'react-native';
import {fontFamilies} from '../constants/fontFamilies';
import {globalStyles} from '../styles/globalStyles';
import RowComponent from './RowComponent';
import TextComponent from './TextComponent';
import {useNavigation} from '@react-navigation/native';
import { appColors } from '../constants';
interface Props {
  title?: string;
  back?: boolean;
  right?: ReactNode;
  children: ReactNode;
  isScroll?: boolean;
}

const Container = (props: Props) => {
  const {title, back, right, children, isScroll} = props;
  const navigation: any = useNavigation();
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={[globalStyles.container, {flex: 1}]}>
        <RowComponent
          styles={{
            paddingBottom: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {back && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft2 size={24} color={appColors.text} />
            </TouchableOpacity>
          )}
          <View style={{flex: 1, zIndex: -1}}>
            {title && (
              <TextComponent
                flex={0}
                font={fontFamilies.bold}
                size={26}
                text={title}
                styles={{textAlign: 'center', marginLeft: back ? -24 : 0}}
              />
            )}
          </View>
        </RowComponent>
        {isScroll ? (
          <ScrollView style={{flex: 1, flexGrow: 1}}>{children}</ScrollView>
        ) : (
          <View style={{flex: 1}}>{children}</View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Container;

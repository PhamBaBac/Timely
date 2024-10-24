// src/components/ModalizeRepeat.tsx
import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import { RowComponent, SpaceComponent, TextComponent } from '../components';
import { appColors } from '../constants';
import { Switch } from 'react-native-gesture-handler';

interface ModalizeRepeatProps {
  visible: boolean;
  onClose: () => void;
  taskDetail: any;
  handleChangeValue: (key: string, value: any) => void;
  setSelectedRepeat: (value: string) => void;
}

const ModalizeRepeat: React.FC<ModalizeRepeatProps> = ({
  visible,
  onClose,
  taskDetail,
  handleChangeValue,
  setSelectedRepeat,
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
        <View style={styles.repeatModalContent}>
          <RowComponent>
            <TextComponent
              text="Chọn lặp lại"
              color={appColors.text}
              styles={{
                fontSize: 16,
                fontWeight: 'bold',
                color: appColors.text,
                flex: 1,
                textAlign: 'left',
                paddingLeft: 10,
              }}
            />
            <Switch
              trackColor={{false: appColors.gray, true: appColors.primary}}
              thumbColor={
                taskDetail.repeat !== 'no' ? appColors.primary : appColors.gray2
              }
              value={taskDetail.repeat !== 'no'}
              onValueChange={val => {
                const newRepeatValue = val ? 'day' : 'no';
                handleChangeValue('repeat', newRepeatValue);
                setSelectedRepeat(val ? 'Ngày' : 'Không');
              }}
            />
          </RowComponent>
          <SpaceComponent height={20} />
          <View style={styles.repeatOptionsContainer}>
            <Text
              style={styles.repeatOptionText}
              onPress={() => {
                handleChangeValue('repeat', 'day');
                modalizeRef.current?.close();
                setSelectedRepeat('Ngày');
              }}>
              Hằng ngày
            </Text>
            <TextComponent
              text="|"
              color={appColors.primary}
              styles={{fontSize: 22}}
            />
            <Text
              style={styles.repeatOptionText}
              onPress={() => {
                handleChangeValue('repeat', 'week');
                modalizeRef.current?.close();
                setSelectedRepeat('Tuần');
              }}>
              Hằng tuần
            </Text>
            <TextComponent
              text="|"
              color={appColors.primary}
              styles={{fontSize: 22}}
            />
            <Text
              style={styles.repeatOptionText}
              onPress={() => {
                handleChangeValue('repeat', 'month');
                modalizeRef.current?.close();
                setSelectedRepeat('Tháng');
              }}>
              Hằng tháng
            </Text>
          </View>
        </View>
      </Modalize>
    </Portal>
  );
};

const styles = StyleSheet.create({
  repeatModalContent: {
    padding: 20,
    paddingBottom: 80,
  },
  repeatOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: appColors.primary,
    borderRadius: 8,
  },
  repeatOptionText: {
    fontSize: 16,
    color: appColors.primary,
  },
});

export default ModalizeRepeat;

import {ActivityIndicator, Modal, View} from 'react-native';
import {TextComponent} from '../components';
import React from 'react';

interface Props {
  visible: boolean;
  mess?: string;
}

const LoadingModal = (props: Props) => {
  const {visible, mess} = props;

  return (
    <Modal
      visible={visible}
      style={[{flex: 1}]}
      transparent
      statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator color={'#ffffff'} size={32} />
        <TextComponent text="Loading" flex={0} color={'#ffffff'} />
      </View>
    </Modal>
  );
};

export default LoadingModal;

import {View, Text, Modal, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {globalStyles} from '../styles/globalStyles';
import RowComponent from '../components/RowComponent';
import TextComponent from '../components/TextComponent';
import {Button} from 'react-native';
import ButtonComponent from '../components/ButtonComponent';
import TitleComponent from '../components/TitleComponent';
import InputComponent from '../components/InputComponent';
import firestore from '@react-native-firebase/firestore';
import {appColors} from '../constants';

interface Props {
  visible: boolean;
  subTask?: any;
  onClose: () => void;
  taskId: string;
}

const initValue = {
  description: '',
  isCompleted: false,
};

const ModalAddSubTask = (props: Props) => {
  const {visible, subTask, onClose, taskId} = props;
  const [subTaskForm, setSubTaskForm] = useState(initValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveToDatabase = async () => {
    const data = {
      ...subTaskForm,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      taskId,
    };

    setIsLoading(true);
    try {
      await firestore().collection('subTasks').add(data);
      console.log('Done');
      setIsLoading(false);
      handleCloseModal();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSubTaskForm(initValue);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      style={globalStyles.modal}
      transparent
      animationType="slide">
      <View style={[globalStyles.modalContainer]}>
        <View
          style={[
            globalStyles.modalContent,
            {
              backgroundColor: appColors.white,
            },
          ]}>
          <TitleComponent text="Thêm công việc phụ" />
          <View style={{paddingVertical: 16}}>
            <InputComponent
              title="Mô tả công việc"
              placeholder="Nhập mô tả công việc"
              value={subTaskForm.description}
              onChange={val =>
                setSubTaskForm({
                  ...subTaskForm,
                  description: val,
                })
              }
              numberOfLine={3}
              multiple
              allowClear
            />
          </View>
          <RowComponent>
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity onPress={handleCloseModal}>
                <TextComponent text="Đóng" flex={0} />
              </TouchableOpacity>
            </View>
            <View style={{flex: 1}}>
              <ButtonComponent
                text="Lưu"
                onPress={handleSaveToDatabase}
                type="primary"
              />
            </View>
          </RowComponent>
        </View>
      </View>
    </Modal>
  );
};

export default ModalAddSubTask;

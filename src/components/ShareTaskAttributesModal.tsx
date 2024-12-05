import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Share,
  Alert,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {TaskModel} from '../models/taskModel';
import {appColors} from '../constants';

interface ShareTaskAttributesModalProps {
  visible: boolean;
  task: TaskModel;
  onClose: () => void;
}

export const ShareTaskAttributesModal: React.FC<
  ShareTaskAttributesModalProps
> = ({visible, task, onClose}) => {
  const [selectedAttributes, setSelectedAttributes] = useState({
    title: true,
    description: true,
    startDate: true,
    startTime: true,
    endDate: true,
    priority: true,
    category: true,
    isImportant: true,
    repeat: true,
    subTasks: true,
  });

  const toggleAttribute = (key: keyof typeof selectedAttributes) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleShare = async () => {
    try {
      const currentUser = auth().currentUser;
      const userEmail = currentUser ? currentUser.email : 'Không rõ email';

      const generateShareMessage = () => {
        const lines: string[] = [];

        if (selectedAttributes.title) {
          lines.push(`Tên công việc: ${task.title}`);
        }

        if (selectedAttributes.description) {
          lines.push(`Mô tả: ${task.description}`);
        }

        if (selectedAttributes.startDate && task.startDate) {
          lines.push(
            `Ngày bắt đầu: ${new Date(task.startDate).toLocaleDateString()}`,
          );
        }

        if (selectedAttributes.startTime && task.startTime) {
          lines.push(
            `Giờ bắt đầu: ${new Date(task.startTime).toLocaleTimeString()}`,
          );
        }

        if (selectedAttributes.endDate && task.endDate) {
          lines.push(
            `Ngày kết thúc: ${new Date(task.endDate).toLocaleDateString()}`,
          );
        }

        if (selectedAttributes.priority) {
          const priorityMap = {
            high: 'Cao',
            medium: 'Trung bình',
            low: 'Thấp',
          };
          lines.push(`Mức độ ưu tiên: ${priorityMap[task.priority]}`);
        }

        if (selectedAttributes.category) {
          lines.push(`Loại công việc: ${task.category || 'Khác'}`);
        }

        if (selectedAttributes.isImportant) {
          lines.push(
            `Mức độ quan trọng: ${
              task.isImportant ? 'Quan trọng' : 'Không quan trọng'
            }`,
          );
        }

        if (selectedAttributes.repeat) {
          const repeatMap: {[key in TaskModel['repeat']]: string} = {
            day: 'Ngày',
            week: 'Tuần',
            month: 'Tháng',
            no: 'Không',
            weekday: 'Ngày trong tuần',
          };
          lines.push(`Lặp lại: ${repeatMap[task.repeat]}`);
        }

        return lines.join('\n');
      };

      const result = await Share.share({
        message: generateShareMessage(),
      });

      if (result.action === Share.sharedAction) {
        // Sharing successful
      }
      onClose();
    } catch (error: any) {
      Alert.alert('Lỗi chia sẻ', error.message);
    }
  };

  const renderAttributeToggle = (
    key: keyof typeof selectedAttributes,
    label: string,
  ) => (
    <TouchableOpacity
      style={styles.attributeToggle}
      onPress={() => toggleAttribute(key)}>
      <Text>{label}</Text>
      <View
        style={[
          styles.checkbox,
          selectedAttributes[key] && styles.checkboxSelected,
        ]}
      />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.shareModalContainer}>
        <View style={styles.shareModalContent}>
          <Text style={styles.shareModalTitle}>Chọn thông tin chia sẻ</Text>

          <View style={styles.attributesContainer}>
            {renderAttributeToggle('title', 'Tên công việc')}
            {renderAttributeToggle('description', 'Mô tả')}
            {renderAttributeToggle('startDate', 'Ngày bắt đầu')}
            {renderAttributeToggle('startTime', 'Giờ bắt đầu')}
            {renderAttributeToggle('endDate', 'Ngày kết thúc')}
            {renderAttributeToggle('priority', 'Mức độ ưu tiên')}
            {renderAttributeToggle('category', 'Loại công việc')}
            {renderAttributeToggle('isImportant', 'Mức độ quan trọng')}
            {renderAttributeToggle('repeat', 'Lặp lại')}
            {renderAttributeToggle('subTasks', 'Nhiệm vụ phụ')}
          </View>

          <View style={styles.shareModalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  shareModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  shareModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  shareModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  attributesContainer: {
    marginBottom: 20,
  },
  attributeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ADB5BD',
    borderRadius: 4,
  },
  checkboxSelected: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  shareModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#F1F3F5',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#495057',
  },
  shareButton: {
    flex: 1,
    padding: 10,
    backgroundColor: appColors.primary,
    borderRadius: 5,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
  },
});

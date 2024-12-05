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
import {ScheduleModel} from '../models/ScheduleModel';

interface ShareAttributesModalProps {
  visible: boolean;
  schedule: ScheduleModel;
  onClose: () => void;
}

const PERIOD_OPTIONS = [
  {label: 'Tiết 1-3', value: '1-3', time: '6:30-9:00'},
  {label: 'Tiết 4-6', value: '4-6', time: '9:05-11:30'},
  {label: 'Tiết 7-9', value: '7-9', time: '12:30-15:00'},
  {label: 'Tiết 10-12', value: '10-12', time: '15:00-17:40'},
  {label: 'Tiết 13-15', value: '13-15', time: '18:00-20:30'},
];

export const ShareAttributesModal: React.FC<ShareAttributesModalProps> = ({
  visible,
  schedule,
  onClose,
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState({
    email: true,
    type: true,
    course: true,
    dates: true,
    period: true,
    room: true,
    instructor: true,
    group: false,
  });

  const toggleAttribute = (key: keyof typeof selectedAttributes) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleShare = async () => {
    try {
      const periodInfo = PERIOD_OPTIONS.find(p => p.value === schedule.period);
      const currentUser = auth().currentUser;
      const userEmail = currentUser ? currentUser.email : 'Không rõ email';

      const generateShareMessage = () => {
        const lines: string[] = [];

        if (selectedAttributes.email) {
          lines.push(`Tài khoản: ${userEmail}`);
        }

        if (selectedAttributes.type) {
          lines.push(schedule.isExam ? 'Lịch thi' : 'Lịch học');
        }

        if (selectedAttributes.course) {
          lines.push(`Môn: ${schedule.course}`);
        }

        if (selectedAttributes.dates) {
          lines.push(
            `Thời gian: ${schedule.startDate.toLocaleDateString()} - ${schedule.endDate.toLocaleDateString()}`,
          );
        }

        if (selectedAttributes.period) {
          lines.push(
            `${schedule.isExam ? 'Ca thi' : 'Tiết học'}: ${
              periodInfo
                ? `${periodInfo.label} (${periodInfo.time})`
                : schedule.period
            }`,
          );
        }

        if (selectedAttributes.room) {
          lines.push(`Phòng: ${schedule.room}`);
        }

        if (selectedAttributes.instructor) {
          lines.push(
            `${schedule.isExam ? 'Giám thị' : 'Giảng viên'}: ${
              schedule.instructor
            }`,
          );
        }

        if (selectedAttributes.group && schedule.group) {
          lines.push(`Nhóm: ${schedule.group}`);
        }

        return lines.join('\n');
      };

      const result = await Share.share({
        message: generateShareMessage(),
      });

      if (result.action === Share.sharedAction) {
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
            {renderAttributeToggle('email', 'Tài khoản')}
            {renderAttributeToggle('type', 'Loại lịch')}
            {renderAttributeToggle('course', 'Môn học/Thi')}
            {renderAttributeToggle('dates', 'Ngày')}
            {renderAttributeToggle('period', 'Tiết/Ca')}
            {renderAttributeToggle('room', 'Phòng')}
            {renderAttributeToggle('instructor', 'Giảng viên/Giám thị')}
            {renderAttributeToggle('group', 'Nhóm')}
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

// Additional styles to be added to existing styles object
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
    backgroundColor: '#228BE6',
    borderColor: '#228BE6',
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
    backgroundColor: '#228BE6',
    borderRadius: 5,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
  },
});

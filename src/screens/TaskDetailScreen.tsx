import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {TaskDetailScreenProps} from '../components/TaskDetailProps';

const TaskDetailScreen = ({route}: TaskDetailScreenProps) => {
  const {task} = route.params;
  const navigation = useNavigation();
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(task.category);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const options = ['Cá nhân', 'Công việc', 'Gia đình', 'Khác'];

  const formatDate = (date: any): string => {
    if (!date) return 'Không';
    if (date instanceof Date) {
      return date.toLocaleDateString('vi-VN');
    }
    if (date._seconds) {
      return new Date(date._seconds * 1000).toLocaleDateString('vi-VN');
    }
    return String(date);
  };

  const formatTime = (time: any): string => {
    if (!time) return 'Không';
    if (time instanceof Date) {
      return time.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (time._seconds) {
      return new Date(time._seconds * 1000).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return String(time);
  };

  const renderDetailItem = (
    icon: string,
    label: string,
    value: any,
    onPress?: () => void,
  ) => (
    <TouchableOpacity style={styles.detailItem} onPress={onPress}>
      <MaterialIcons name={icon} size={24} color="#757575" />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
      {onPress && (
        <MaterialIcons name="chevron-right" size={24} color="#757575" />
      )}
    </TouchableOpacity>
  );

  const renderListItem = ({item}: {item: string}) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setSelectedOption(item);
        setIsListOpen(false);
      }}>
      <Text style={styles.listItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const handleOptionSelect = (option: string) => {
    // Handle the selected option (mark as completed, share, delete)
    console.log(option);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsListOpen(!isListOpen)}>
          <Text style={styles.dropdownText}>{selectedOption}</Text>
          <MaterialIcons
            name={isListOpen ? 'arrow-drop-up' : 'arrow-drop-down'}
            size={24}
            color="#000"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setIsModalVisible(true)}>
          <MaterialIcons name="more-vert" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {isListOpen && (
        <FlatList
          data={options}
          renderItem={renderListItem}
          keyExtractor={item => item}
          style={styles.flatList}
        />
      )}

      <ScrollView>
        <TextInput
          style={styles.titleInput}
          value={task.description}
          placeholder="Nhập tiêu đề nhiệm vụ"
        />

        <TouchableOpacity style={styles.addSubtaskButton}>
          <MaterialIcons name="add" size={24} color="#1a73e8" />
          <Text style={styles.addSubtaskText}>Thêm nhiệm vụ phụ</Text>
        </TouchableOpacity>

        {renderDetailItem('event', 'Ngày đến hạn', formatDate(task.dueDate))}
        {renderDetailItem(
          'access-time',
          'Thời gian & Lời nhắc',
          formatTime(task.remind),
        )}
        {renderDetailItem('repeat', 'Lặp lại nhiệm vụ', task.repeat || 'Không')}
        {renderDetailItem('note', 'Ghi chú', 'THÊM', () => {})}
        {renderDetailItem('attach-file', 'Tập tin đính kèm', 'THÊM', () => {})}
        {renderDetailItem(
          'Start',
          'Đánh đáu',
          task.isImportant ? 'Quan trọng' : 'Không quan trọng',
        )}
      </ScrollView>

      {/* Options Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn tùy chọn</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleOptionSelect('Đánh dấu đã xong')}>
              <Text style={styles.modalOptionText}>Đánh dấu đã xong</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleOptionSelect('Chia sẻ')}>
              <Text style={styles.modalOptionText}>Chia sẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleOptionSelect('Xóa')}>
              <Text style={styles.modalOptionText}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    marginRight: 8,
  },
  moreButton: {
    padding: 8,
    flexDirection: 'row',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addSubtaskText: {
    color: '#1a73e8',
    marginLeft: 8,
    fontSize: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailContent: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 16,
    color: '#212121',
  },
  detailValue: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  flatList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listItemText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#1a73e8',
    textAlign: 'center',
  },
  modalCancel: {
    marginTop: 10,
    paddingVertical: 15,
    backgroundColor: '#f44336',
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});

export default TaskDetailScreen;

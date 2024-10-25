import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  Pressable,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../constants';
import {TaskModel} from '../models/taskModel';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

interface SearchScreenProps {
  visible: boolean;
  onClose: () => void;
  onSelectTask: (task: TaskModel) => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({
  visible,
  onClose,
  onSelectTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const categories = useSelector(
    (state: RootState) => state.categories.categories,
  );
  const [filteredTasks, setFilteredTasks] = useState<TaskModel[]>([]);

  useEffect(() => {
    const filtered = tasks.filter(task => {
      const matchesSearch =
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory
        ? task.category === selectedCategory
        : true;

      return matchesSearch && matchesCategory;
    });

    setFilteredTasks(filtered);
  }, [searchQuery, selectedCategory, tasks]);

  const renderTask = ({item}: {item: TaskModel}) => (
    <Pressable
      style={styles.taskItem}
      onPress={() => {
        onSelectTask(item);
        onClose();
      }}>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>
          {item.title ? item.title : item.description}
        </Text>
        <Text style={styles.taskCategory}>{item.category}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={appColors.gray} />
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={appColors.black}
            />
          </Pressable>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={24} color={appColors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm công việc..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={24} color={appColors.gray} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <FlatList
            data={[{name: 'Tất cả'}, ...categories]}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <Pressable
                style={[
                  styles.categoryButton,
                  selectedCategory === item.name && styles.selectedCategory,
                ]}
                onPress={() =>
                  setSelectedCategory(item.name === 'Tất cả' ? null : item.name)
                }>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item.name &&
                      styles.selectedCategoryText,
                  ]}>
                  {item.name}
                </Text>
              </Pressable>
            )}
            keyExtractor={item => item.name}
          />
        </View>

        {filteredTasks.length > 0 ? (
          <FlatList
            data={filteredTasks}
            renderItem={renderTask}
            keyExtractor={item => item.id}
            style={styles.tasksList}
          />
        ) : (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>
              Không tìm thấy công việc nào
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.whitesmoke,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: appColors.white,
    borderBottomWidth: 1,
    borderBottomColor: appColors.lightGray,
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.whitesmoke,
    borderRadius: 8,
    padding: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: appColors.black,
  },
  categoriesContainer: {
    padding: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: appColors.gray2,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: appColors.primary,
  },
  categoryText: {
    color: appColors.black,
    fontSize: 14,
  },
  selectedCategoryText: {
    color: appColors.white,
  },
  tasksList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: appColors.white,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: appColors.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: appColors.black,
    marginBottom: 4,
  },
  taskCategory: {
    fontSize: 14,
    color: appColors.gray,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: appColors.gray,
  },
});

export default SearchScreen;

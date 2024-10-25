import React, {useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../constants/appColor';

interface HeaderComponentProps {
  title: string;
  onMenuPress: () => void;
  onSearchPress: (query: string) => void;
}

const HeaderComponent = ({
  title,
  onMenuPress,
  onSearchPress,
}: HeaderComponentProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchPress = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      onSearchPress(searchQuery);
    }
  };

  const handleOutsidePress = () => {
    if (isSearching) {
      setIsSearching(false);
      Keyboard.dismiss();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={onMenuPress}>
          <MaterialIcons name="menu" size={24} color="#000" />
        </Pressable>
        {isSearching ? (
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search..."
            autoFocus
          />
        ) : (
          <Text style={styles.headerTitle}>{title}</Text>
        )}
        <Pressable style={styles.iconButton} onPress={handleSearchPress}>
          <MaterialIcons name="search" size={24} color={appColors.black} />
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: appColors.white,
    borderBottomWidth: 1,
    borderBottomColor: appColors.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.black,
  },
  iconButton: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    borderColor: appColors.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 10,
  },
});

export default HeaderComponent;

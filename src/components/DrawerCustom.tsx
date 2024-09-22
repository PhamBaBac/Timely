import React, {useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  Text,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../constants';
import {RowComponent, TextComponent} from '.';

const DrawerCustom = ({navigation}: any) => {
  const size = 24;
  const color = appColors.gray;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categorioption = [
    {
      id: 1,
      name: 'Công việc',
      icon: 'work',
      color: appColors.red,
    },
    {
      id: 2,
      name: 'Con người',
      icon: 'person',
      color: appColors.blue,
    },
    {
      id: 3,
      name: 'Học tập',
      icon: 'school',
      color: appColors.green,
    },
  ];

  const profileMenu = [
    {
      key: 'StartTask',
      title: 'Start Task',
      icon: (
        <MaterialIcons name="play-circle-outline" size={size} color={color} />
      ),
    },
    {
      key: 'Habits',
      title: 'Thói quen',
      icon: <MaterialIcons name="auto-graph" size={size} color={color} />,
    },
    {
      key: 'Categories',
      title: 'Thể loại',
      icon: <MaterialIcons name="category" size={size} color={color} />,
      action: () =>
        setExpandedCategory(
          expandedCategory === 'Categories' ? null : 'Categories',
        ),
    },
  ];

  const renderItem = ({
    item,
  }: {
    item: {key: string; title: string; icon: JSX.Element; action?: () => void};
  }) => (
    <>
      <RowComponent
        styles={localStyles.listItem}
        onPress={item.action ? item.action : () => navigation.closeDrawer()}>
        {item.icon}
        <TextComponent text={item.title} styles={localStyles.listItemText} />
      </RowComponent>
      {item.key === 'Categories' && expandedCategory === 'Categories' && (
        <FlatList
          data={categorioption}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <RowComponent styles={localStyles.categoryItem}>
              <MaterialIcons name={item.icon} size={size} color={item.color} />
              <TextComponent
                text={item.name}
                styles={localStyles.categoryItemText}
              />
            </RowComponent>
          )}
          contentContainerStyle={localStyles.categoryList}
        />
      )}
    </>
  );

  return (
    <View style={localStyles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={profileMenu}
        style={{flex: 1, marginVertical: 20}}
        renderItem={renderItem}
      />
    </View>
  );
};

export default DrawerCustom;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingVertical: Platform.OS === 'android' ? StatusBar.currentHeight : 48,
  },
  listItem: {
    paddingVertical: 12,
    justifyContent: 'flex-start',
  },
  listItemText: {
    paddingLeft: 12,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingLeft: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  categoryItemText: {
    paddingLeft: 12,
  },
  categoryList: {
    marginTop: 0,
    paddingVertical: 0,
  },
});

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
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const DrawerCustom = ({navigation}: any) => {
  const size = 24;
  const color = appColors.gray;

  const profileMenu = [
    {
      key: 'StartTask',
      title: 'Nhiệm vụ nổi bật',
      icon: (
        <MaterialIcons name="play-circle-outline" size={size} color={color} />
      ),
      action: () => navigation.navigate('StartTaskScreen'),
    },
    {
      key: 'CompletedTasks',
      title: 'Nhiệm vụ đã hoàn thành', // Added new menu item for completed tasks
      icon: <MaterialIcons name="done" size={size} color={color} />,
      action: () => navigation.navigate('CompletedScreen'), // Add navigation action here
    },
    {
      key: 'Habits',
      title: 'Thói quen',
      icon: <MaterialIcons name="auto-graph" size={size} color={color} />,
    },
    {
      key: 'Logout',
      title: 'Logout',
      icon: <MaterialIcons name="logout" size={size} color={color} />,
      action: () => handleSingout(),
    },
  ];

  const renderItem = ({
    item,
  }: {
    item: {key: string; title: string; icon: JSX.Element; action?: () => void};
  }) => (
    <RowComponent
      styles={localStyles.listItem}
      onPress={item.action ? item.action : () => navigation.closeDrawer()}>
      {item.icon}
      <TextComponent text={item.title} styles={localStyles.listItemText} />
    </RowComponent>
  );

  const handleSingout = async () => {
    const token = await AsyncStorage.getItem('fcmtoken');
    const currentUser = auth().currentUser;
    if (currentUser) {
      await firestore()
        .doc(`users/${currentUser.uid}`)
        .get()
        .then(snap => {
          if (snap.exists) {
            const data: any = snap.data();
            if (data.tokens && data.tokens.includes(token)) {
              firestore()
                .doc(`users/${currentUser.uid}`)
                .update({
                  tokens: firestore.FieldValue.arrayRemove(token),
                })
                .then(() => {
                  console.log('Token removed from Firestore');
                })
                .catch(error => {
                  console.error('Error removing token from Firestore:', error);
                });
            } else {
              console.log('Token not found in Firestore');
            }
          }
        })
        .catch(error => {
          console.error('Error getting document:', error);
        });
    }
    await auth().signOut();
    await AsyncStorage.removeItem('fcmtoken');
  };

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
});

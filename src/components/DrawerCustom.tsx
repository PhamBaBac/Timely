import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  Text,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appColors, appInfo} from '../constants';
import {RowComponent, SpaceComponent, TextComponent} from '.';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, {firebase} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {TaskModel} from '../models/taskModel';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {TickSquare} from 'iconsax-react-native';

const DrawerCustom = ({navigation}: any) => {
  const size = 24;
  const color = appColors.black;
  const user = auth().currentUser;
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .where('uid', '==', user?.uid)
      .onSnapshot(snapshot => {
        const tasksList = snapshot.docs.map(doc => {
          const taskData = doc.data() as TaskModel;

          // Chuyển đổi dueDate và startTime (nếu có) thành Date hoặc chuỗi ISO
          const dueDate =
            taskData.dueDate instanceof firebase.firestore.Timestamp
              ? taskData.dueDate.toDate().toISOString()
              : taskData.dueDate;

          const startTime =
            taskData.startTime instanceof firebase.firestore.Timestamp
              ? taskData.startTime.toDate().toISOString()
              : taskData.startTime;

          const endDate =
            taskData.endDate instanceof firebase.firestore.Timestamp
              ? taskData.endDate.toDate().toISOString()
              : taskData.endDate; // Giữ nguyên nếu không phải Timestamp

          return {
            ...taskData,
            id: doc.id,
            dueDate,
            startTime,
            endDate,
          } as TaskModel;
        });

        setTasks(tasksList);
      });

    return () => unsubscribe();
  }, [user]);

  const profileMenu = [
    {
      key: 'StartTask',
      title: 'Những công việc quan trọng',
      icon: <AntDesign name="staro" size={size} color="#FF8A65" />,
      action: () =>
        navigation.navigate('StartTaskScreen', {
          tasks: tasks.filter(task => task.isImportant),
        }),
    },
    {
      key: 'CompletedTasks',
      title: 'Các công việc đã hoàn thành', // Added new menu item for completed tasks
      icon: (
        <MaterialIcons
          name="check-circle"
          size={24}
          color={appColors.primary}
        />
      ),
      action: () =>
        navigation.navigate('IsCompleTaskScreen', {
          tasks: tasks.filter(task => task.isCompleted),
        }),
    },
    {
      key: 'Habits',
      title: 'Thói quen',
      icon: <MaterialIcons name="auto-graph" size={size} color='green' />,
    },
    {
      key: 'Logout',
      title: 'Đăng xuất',
      icon: <MaterialIcons name="logout" size={size} color='red' />,
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
      <SpaceComponent width={10} />
      <Text
        style={{
          color: appColors.black,
          fontSize: 16,
        }}>
        {item.title}
      </Text>
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
    await AsyncStorage.removeItem('completedTasks');
    await AsyncStorage.removeItem('importantTasks');
    await AsyncStorage.removeItem('deletedTasks');
  };

  return (
    <View style={localStyles.container}>
      <Image
        source={require('../assets/images/logoTimeLy1.png')}
        style={{
          resizeMode: 'contain',
          width: appInfo.sizes.WIDTH * 0.6,
        }}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={profileMenu}
        style={{flex: 1,}}
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

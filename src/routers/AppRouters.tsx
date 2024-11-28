import {useEffect, useState} from 'react';
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import auth from '@react-native-firebase/auth';
import {HandleNotification} from '../utils/handleNotification';
import messaging from '@react-native-firebase/messaging';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import BackgroundActions from 'react-native-background-actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppRouters = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [isLogin, setIsLogin] = useState(false);

  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const user = auth().currentUser;

  useEffect(() => {
    auth().onAuthStateChanged(user => {
      user ? setIsLogin(true) : setIsLogin(false);
    });

    HandleNotification.getAccessToken();

    messaging().onNotificationOpenedApp((mess: any) => {
      console.log('Notification opened from background', mess);
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Received background message:', remoteMessage);
    });

    const timeout = setTimeout(() => {
      setIsShowSplash(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const checkUpcomingTasks = async () => {
    const now = new Date();

    let notifiedTasksString = await AsyncStorage.getItem('notifiedTasks');
    let notifiedTasks = notifiedTasksString
      ? new Set(JSON.parse(notifiedTasksString))
      : new Set();

    const upcomingTasks = tasks.filter(task => {
      if (!task.startTime || !task.remind) return false;
      const remindTime = Number(task.remind) * 60 * 1000;
      const taskTime = new Date(task.startTime).getTime();
      const timeDate = new Date(task.startTime).getDate();
      const timeDiff = taskTime - now.getTime();
      return (
        timeDiff > 0 && timeDiff <= remindTime && timeDate === now.getDate()
      );
    });

    upcomingTasks.forEach(async task => {
      if (!notifiedTasks.has(task.id)) {
        HandleNotification.SendNotification({
          memberId: user?.uid || '',
          title: `Task "${task.title}"`,
          body: task.description,
          taskId: task.id,
        });
        notifiedTasks.add(task.id); // Đánh dấu task là đã thông báo

        // Lưu trạng thái mới vào AsyncStorage
        await AsyncStorage.setItem(
          'notifiedTasks',
          JSON.stringify([...notifiedTasks]),
        );
      }
    });
  };

  // Tùy chọn cho BackgroundActions
  const options = {
    taskName: 'UpcomingTasks',
    taskTitle: 'Hi!',
    taskDesc: 'Bắt tay vào công việc nào!',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ff00ff',
    parameters: {
      delay: 3000, // Kiểm tra mỗi phút
    },
  };

  // Kích hoạt BackgroundActions
  useEffect(() => {
    const startBackgroundTask = async () => {
      try {
        console.log('Starting background task...');
        await BackgroundActions.start(async taskData => {
          while (BackgroundActions.isRunning()) {
            await checkUpcomingTasks();
            if (taskData) {
              await new Promise(resolve => setTimeout(resolve, taskData.delay));
            }
          }
        }, options);
      } catch (error) {
        console.error(error);
      }
    };

    startBackgroundTask();

    return () => {
      BackgroundActions.stop();
    };
  }, [tasks]);

  return (
    <>
      {isShowSplash ? (
        <SplashScreen />
      ) : isLogin ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </>
  );
};

export default AppRouters;

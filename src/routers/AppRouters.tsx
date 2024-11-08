import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import auth from '@react-native-firebase/auth';
import {HandleNotification} from '../utils/handleNotification';
import messaging from '@react-native-firebase/messaging';
import BackgroundTimer from 'react-native-background-timer';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

const AppRouters = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    auth().onAuthStateChanged(user => {
      user ? setIsLogin(true) : setIsLogin(false);
    });
    HandleNotification.getAccessToken();
    messaging().onNotificationOpenedApp((mess: any) => {});
    const timeout = setTimeout(() => {
      setIsShowSplash(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);
  // const tasks = useSelector((state: RootState) => state.tasks.tasks);
  // const user = auth().currentUser;

// useEffect(() => {
//   const checkUpcomingTasks = () => {
//     console.log('Checking upcoming tasks...');
//     const now = new Date();
//     const threeMinutes = 3 * 60 * 1000;

//     // Tìm các task sắp đến hạn trong vòng 3 phút tới
//     const upcomingTasks = tasks.filter(task => {
//       console.log('Task:', task.title, task.dueDate);
//       if (!task.dueDate) return false;

//       const taskTime = new Date(task.dueDate).getTime();
//       const timeDiff = taskTime - now.getTime();

//       return timeDiff > 0 && timeDiff <= threeMinutes;
//     });

//     // Gửi thông báo cho từng task sắp diễn ra
//     upcomingTasks.forEach(task => {
//       console.log('Task:', task.title, task.dueDate);
//       HandleNotification.SendNotification({
//         memberId: user?.uid || '',
//         title: `Task "${task.title}" is starting soon`,
//         body: task.description,
//         taskId: task.id,
//       });
//       console.log('Task starting soon:', task.title);
//     });
//   };

//   BackgroundTimer.runBackgroundTimer(checkUpcomingTasks, 6000); // Chạy mỗi 6 giây

//   return () => {
//     BackgroundTimer.stopBackgroundTimer();
//   };
// }, [tasks]);


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

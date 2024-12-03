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

  useEffect(() => {
    auth().onAuthStateChanged(user => {
      user ? setIsLogin(true) : setIsLogin(false);
    });

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

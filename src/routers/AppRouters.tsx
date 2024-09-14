import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {useEffect, useState} from 'react';
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import auth from '@react-native-firebase/auth';

const AppRouters = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);

  const [isLogin, setIsLogin] = useState(false);

  

  useEffect(() => {
    auth().onAuthStateChanged(user => {
      user ? setIsLogin(true) : setIsLogin(false);
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

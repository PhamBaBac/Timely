import React, {useEffect, useState} from 'react';
import SplashScreen from '../screens/SplashScreen';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';

const AppRouters = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);
  }, []);

  return (
    <>
      {isShowSplash ? (
        <SplashScreen />
      ) : 1 < 2 ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </>
  );
};

export default AppRouters;

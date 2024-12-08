import {useFocusEffect} from '@react-navigation/native';
import {Platform, StatusBar} from 'react-native';
import React from 'react';

function useCustomStatusBar(barStyle: 'default' | 'light-content' | 'dark-content', backgroundColor: string) {
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle(barStyle);
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(backgroundColor);
      }
    }, [barStyle, backgroundColor]),
  );
}

export default useCustomStatusBar;

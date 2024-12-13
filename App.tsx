import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import AppRouters from './src/routers/AppRouters';
import {Host} from 'react-native-portalize';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import linking from './linking';


const App = () => {


  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Host>
        <NavigationContainer linking={linking}>
          <AppRouters />
        </NavigationContainer>
      </Host>
      <Toast />
    </GestureHandlerRootView>
  );
};

export default App;

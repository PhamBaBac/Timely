import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import AppRouters from './src/routers/AppRouters';
import {Provider, useSelector} from 'react-redux';
import {Host} from 'react-native-portalize';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';


const App = () => {


  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Host>
        <NavigationContainer>
          <AppRouters />
        </NavigationContainer>
      </Host>
      <Toast/>
    </GestureHandlerRootView>
  );
};

export default App;

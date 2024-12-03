import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import AppRouters from './src/routers/AppRouters';
import {Provider, useSelector} from 'react-redux';
import {Host} from 'react-native-portalize';
import {GestureHandlerRootView} from 'react-native-gesture-handler';


const App = () => {


  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Host>
        <NavigationContainer>
          <AppRouters />
        </NavigationContainer>
      </Host>
    </GestureHandlerRootView>
  );
};

export default App;

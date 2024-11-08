import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import AppRouters from './src/routers/AppRouters';
import {Provider, useSelector} from 'react-redux';
import store, {RootState} from './src/redux/store';
import {Host} from 'react-native-portalize';
import {GestureHandlerRootView} from 'react-native-gesture-handler';


const App = () => {


  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <Host>
          <NavigationContainer>
            <AppRouters />
          </NavigationContainer>
        </Host>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import AppRouters from './src/routers/AppRouters';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { Host } from 'react-native-portalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
}

export default App
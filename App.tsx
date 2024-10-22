import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import AppRouters from './src/routers/AppRouters';
import { Provider } from 'react-redux';
import store from './src/redux/store';
const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppRouters />
      </NavigationContainer>
    </Provider>
  );
}

export default App
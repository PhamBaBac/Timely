import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import AppRouters from './src/routers/AppRouters';
const App = () => {
  return (
    <NavigationContainer>
      <AppRouters />
    </NavigationContainer>
  );
}

export default App
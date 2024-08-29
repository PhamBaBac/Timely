import { View, Text } from 'react-native'
import React from 'react'
import { fontFamilies } from './src/constants';

const App = () => {
  return (
    <NavigationContainer>
      <AppRouters />
    </NavigationContainer>
  );
}

export default App
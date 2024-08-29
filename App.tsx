import { View, Text } from 'react-native'
import React from 'react'
import { fontFamilies } from './src/constants';

const App = () => {
  return (
    <View>
      <Text style={{fontSize: 18, color: 'red', fontFamily: fontFamilies.bold}}>
        Hello word!
      </Text>
      <Text
        style={{fontSize: 18, color: 'red', fontFamily: fontFamilies.semiBold}}>
        Hello word!
      </Text>
      <Text
        style={{fontSize: 18, color: 'red', fontFamily: fontFamilies.medium}}>
        Hello word!
      </Text>
      <Text
        style={{fontSize: 18, color: 'red', fontFamily: fontFamilies.regular}}>
        Hello word!
      </Text>
    </View>
  );
}

export default App
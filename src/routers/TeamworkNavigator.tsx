import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {Teamwork} from '../screens';

const MapNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Teamwork" component={Teamwork} />
    </Stack.Navigator>
  );
}

export default MapNavigator
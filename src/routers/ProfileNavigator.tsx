import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {ProfileScreen} from '../screens';
import TaskListScreen from '../screens/profiles/TaskListScreen';

const ProfileNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="TaskListScreen" component={TaskListScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;

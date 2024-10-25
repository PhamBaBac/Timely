import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {CalendarScreen} from '../screens';
import TaskDetailsScreen from '../screens/TaskDetailScreen';

const CalendarNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
    </Stack.Navigator>
  );
};

export default CalendarNavigator;

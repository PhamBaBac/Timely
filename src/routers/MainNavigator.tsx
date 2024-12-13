import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import DrawerNavigator from './DrawerNavigator';
import {CategoryScreen, IsCompleTaskScreen, TaskCompletedLate} from '../screens';
import TaskDetailsScreen from '../screens/TaskDetailScreen';
import ListTasks from '../screens/ListTask';
import EditScreen from '../screens/EditScreen';

const MainNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="TaskDetailsScreen" component={TaskDetailsScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="ListTasks" component={ListTasks} />
      <Stack.Screen name="IsCompleTaskScreen" component={IsCompleTaskScreen} />
      <Stack.Screen name="TaskCompletedLate" component={TaskCompletedLate} />
      <Stack.Screen name="EditScreen" component={EditScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;

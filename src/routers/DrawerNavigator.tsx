import {createDrawerNavigator} from '@react-navigation/drawer';
import React from 'react';
import DrawerCustom from '../components/DrawerCustom';
import TabNavigator from './TabNavigator';
import StartTaskScreen from '../screens/StartTaskScreen'; //
const DrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        drawerPosition: 'left',
      })}
      drawerContent={props => <DrawerCustom {...props} />}>
      <Drawer.Screen name="TabNavigator" component={TabNavigator} />
      <Drawer.Screen name="StartTaskScreen" component={StartTaskScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;

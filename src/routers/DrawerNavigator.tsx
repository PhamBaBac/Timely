import {
  createDrawerNavigator
} from '@react-navigation/drawer';
import React from 'react';
import DrawerCustom from '../components/DrawerCustom';
import TabNavigator from './TabNavigator';

const DrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        drawerPosition: 'left',
      })}
       drawerContent={props => <DrawerCustom {...props} />}
    >
      <Drawer.Screen name="TabNavigator" component={TabNavigator} />
      <Drawer.Screen name="Start Task" component={TabNavigator} />
      <Drawer.Screen name="Thể loại" component={TabNavigator} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;

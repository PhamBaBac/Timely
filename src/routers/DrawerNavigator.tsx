import { createDrawerNavigator, DrawerContent, DrawerItemList, DrawerToggleButton } from '@react-navigation/drawer';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import TabNavigator from './TabNavigator';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomDrawerContent from './CustomDrawerContent';


const DrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        drawerPosition: 'left',
        drawerIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'TabNavigator':
              iconName = 'home'; 
              break;
            case 'Start Task':
              iconName = 'task'; 
              break;
            case 'Thể loai':
              iconName = 'category'; 
              break;
            default:
              iconName = 'info'; 
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
      //  drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="TabNavigator" component={TabNavigator} />
      <Drawer.Screen name="Start Task" component={TabNavigator} />
      <Drawer.Screen name="Thể loại" component={TabNavigator} />
  
      
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;

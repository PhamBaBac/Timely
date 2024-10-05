import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AddSquare, Calendar, Location, TaskSquare, User} from 'iconsax-react-native';
import React, {ReactNode} from 'react';
import {Platform, View} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../constants';

import {TextComponent} from '../components';
import {globalStyles} from '../styles/globalStyles';
import {AddNewScreen} from '../screens';
import CalendarNavigator from './CalendarNavigator';
import TaskPersonalNavigator from './TaskPersonalNavigator';
import TeamworkNavigator from './TeamworkNavigator';
import ProfileNavigator from './ProfileNavigator';

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'android' ? 78 : 88,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIcon: ({focused, color, size}) => {
          let icon: ReactNode;
          color = focused ? appColors.primary : appColors.gray4;
          size = 23;
          switch (route.name) {
            case 'Home':
              icon = <TaskSquare variant="Bold" size={size} color={color} />;
              break;
            case 'Nhiệm vụ':
              icon = <Calendar variant="Bold" size={size} color={color} />;
              break;
            case 'Lịch học':
              icon = (
                <MaterialIcons name="group-work" color={color} size={size} />
              );
              break;
            case 'Của tôi':
              icon = <User variant="Bold" color={color} size={size} />;
              break;
            case 'Add':
              icon = (
                <View
                  style={[
                    {
                      width: 62,
                      height: 62,
                      borderRadius: 100,
                      backgroundColor: appColors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: Platform.OS === 'ios' ? -60 : -90,
                    },
                    globalStyles.shadow,
                  ]}>
                  <AddSquare size={30} color={appColors.white} />
                </View>
              );
              break;
            default:
              break;
          }
          return icon;
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'android' ? 12 : 8,
        },
        tabBarLabel: ({focused}) => {
          return route.name === 'Add' ? null : (
            <TextComponent
              text={route.name}
              size={14}
              color={focused ? appColors.primary : appColors.gray4}
              styles={{marginBottom: Platform.OS === 'android' ? 16 : 0}}
            />
          );
        },
      })}>
      <Tab.Screen name="Home" component={TaskPersonalNavigator} />
      <Tab.Screen name="Nhiệm vụ" component={CalendarNavigator} />
      <Tab.Screen name="Add" component={AddNewScreen} />
      <Tab.Screen name="Lịch học" component={TeamworkNavigator} />
      <Tab.Screen name="Của tôi" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

export default TabNavigator;

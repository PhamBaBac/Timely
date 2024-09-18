import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Platform } from 'react-native';
import { AddSquare, Home, InfoCircle, Settings } from 'iconsax-react-native';
import { appColors } from '../constants';

export default function CustomDrawerContent(props) {
    const { state, navigation } = props;
    const activeRoute = state.routes[state.index]?.name; // Get the currently active route

    return (
        <DrawerContentScrollView {...props}>
            {/* Conditionally render drawer items based on the active route */}
            {activeRoute === 'Thể loại' && (
                <DrawerItem
                    label="Home"
                    onPress={() => navigation.navigate('Home')}
                    icon={() => (
                        <View
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 100,
                                backgroundColor: appColors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: Platform.OS === 'ios' ? -20 : -90,
                            }}
                        >
                            <Home size={30} color={appColors.white} />
                        </View>
                    )}
                />
            )}

            <DrawerItem
                label="About"
                onPress={() => navigation.navigate('About')}
                icon={() => (
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 100,
                            backgroundColor: appColors.primary,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <InfoCircle size={30} color={appColors.white} />
                    </View>
                )}
            />

            <DrawerItem
                label="Settings"
                onPress={() => navigation.navigate('Settings')}
                icon={() => (
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 100,
                            backgroundColor: appColors.primary,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Settings size={30} color={appColors.white} />
                    </View>
                )}
            />

            <DrawerItem
                label="Add"
                onPress={() => navigation.navigate('Add')}
                icon={() => (
                    <View
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: 100,
                            backgroundColor: appColors.primary,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <AddSquare size={30} color={appColors.white} />
                    </View>
                )}
            />
        </DrawerContentScrollView>
    );
}

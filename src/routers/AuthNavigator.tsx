import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import { ForgotPassword, LoginScreen, SignUpScreen, Verification } from '../screens'

const AuthNavigator = () => {
    const Stack = createNativeStackNavigator()
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Verification" component={Verification} />
    </Stack.Navigator>
  );
}

export default AuthNavigator
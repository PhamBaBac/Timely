<<<<<<<<< Temporary merge branch 1
import { View, Text } from 'react-native'
import React from 'react'

const HomeScreen = () => {
  return (
    <View>
      <Text>HomeScreen</Text>
=========
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React from 'react';
import { Button, Text, View } from 'react-native';
import { ButtonComponent } from '../../components';
const date = new Date();

const HomeScreen = () => {
  const handleSingout = async () => {
    const token = await AsyncStorage.getItem('fcmtoken'); // Retrieve token from AsyncStorage
    const currentUser = auth().currentUser;
    if (currentUser) {
      await firestore()
        .doc(`users/${currentUser.uid}`)
        .get()
        .then(snap => {
          if (snap.exists) {
            const data: any = snap.data();
            if (data.tokens && data.tokens.includes(token)) {
              firestore()
                .doc(`users/${currentUser.uid}`)
                .update({
                  tokens: firestore.FieldValue.arrayRemove(token),
                })
                .then(() => {
                  console.log('Token removed from Firestore');
                })
                .catch(error => {
                  console.error('Error removing token from Firestore:', error);
                });
            } else {
              console.log('Token not found in Firestore');
            }
          }
        })
        .catch(error => {
          console.error('Error getting document:', error);
        });
    }
    await auth().signOut();

    // Remove token from AsyncStorage
    await AsyncStorage.removeItem('fcmtoken');

    // Remove token from Firestore

    // Sign out the user
  };

  return (
    <View>
      <Text>HomeScreen</Text>
      <ButtonComponent
       type='primary'
        text="Sign out"
        onPress={handleSingout}
        
      />
>>>>>>>>> Temporary merge branch 2
    </View>
  )
}

export default HomeScreen
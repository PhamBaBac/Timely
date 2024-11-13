import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
const serviceAccount = require('../../service-account.json');

const user = auth().currentUser;

export class HandleNotification {
  static checkNotificationPersion = async () => {
    const authStatus = await messaging().requestPermission();

    if (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      this.getFcmToken();
    }
  };

  static getFcmToken = async () => {
    const fcmtoken = await AsyncStorage.getItem('fcmtoken');
    if (!fcmtoken) {
      const token = await messaging().getToken();
      if (token) {
        await AsyncStorage.setItem('fcmtoken', token);
        this.UpdateToken(token);
      }
    }
  };

  static UpdateToken = async (token: string) => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      await firestore()
        .doc(`users/${currentUser.uid}`)
        .get()
        .then(snap => {
          if (snap.exists) {
            const data: any = snap.data();

            if (!data.tokens || !data.tokens.includes(token)) {
              firestore()
                .doc(`users/${currentUser.uid}`)
                .update({
                  tokens: firestore.FieldValue.arrayUnion(token),
                });
            }
          }
        });
    }
  };

  static getAccessToken = async () => {
    try {
      const res = await fetch(
        'https://server-todolist-5jwg.onrender.com/get-accesstoken',
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // email: serviceAccount.client_email,
            // key: serviceAccount.private_key,
          }),
        },
      );
      const result = await res.json();
      const accessToken = result.data.access_token;
      return accessToken;
    } catch (error) {
      console.log(error);
    }
  };

  static SendNotification = async ({
    memberId,
    title,
    body,
    taskId,
  }: {
    memberId: string;
    title: string;
    body: string;
    taskId: string;
  }) => {
    try {
      // Save to Firestore
      await firestore().collection('notifications').add({
        isRead: false,
        createdAt: Date.now(),
        updatedAT: Date.now(),
        title,
        body,
        taskId,
        uid: memberId,
      });

      // Send Notification
      const member: any = await firestore().doc(`users/${memberId}`).get();

      if (member && member.data().tokens) {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append(
          'Authorization',
          `Bearer ${await this.getAccessToken()}`,
        );

        var raw = JSON.stringify({
          message: {
            token: member.data().tokens[member.data().tokens.length - 1],
            notification: {
              title,
              body,
            },
            data: {
              taskId,
            },
          },
        });

        var requestOptions: any = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow',
        };

        fetch(
          'https://fcm.googleapis.com/v1/projects/timely-d206d/messages:send',
          requestOptions,
        )
          .then(response => response.json())
          .then(result => console.log(result))
          .catch(error => console.log('error', error));
      }
    } catch (error) {
      console.log('Error sending notification:', error);
    }
  };

  
}

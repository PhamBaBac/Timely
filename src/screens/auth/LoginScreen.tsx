import React, {useState} from 'react';
import {Lock, Sms} from 'iconsax-react-native';
import {Image, ImageBackground, StatusBar, Text, View} from 'react-native';
import auth from '@react-native-firebase/auth';
import { ButtonComponent, Container, InputComponent, RowComponent, SectionComponent, SpaceComponent, TextComponent } from '../../components';
import TitleComponent from '../../components/TitleComponent';
import { appColors, appInfo, fontFamilies } from '../../constants';
import { globalStyles } from '../../styles/globalStyles';

const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorText('Please enter your email and password!!!');
    } else {
      setErrorText('');
      setIsLoading(true);
      await auth()
        .signInWithEmailAndPassword(email, password)
        .then(userCredential => {
          const user = userCredential.user;

          if (user) {
            setIsLoading(false);
          }
        })
        .catch(error => {
          setErrorText(error.message);
          setIsLoading(false);
        });
    }
  };
  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor={appColors.white} />
      <RowComponent
        styles={{
          marginTop: 40,
        }}>
        <Image
          source={require('../../assets/images/logoTimeLy1.png')}
          style={{
            width: appInfo.sizes.WIDTH,
            resizeMode: 'contain',
            //Xoa mau background cua anh
          }}
        />
      </RowComponent>
      <SpaceComponent height={20} />
      <SectionComponent
        styles={{
          flex: 1,
        }}>
        <TitleComponent
          text="Login"
          font={fontFamilies.medium}
          size={22}
          flex={0}
        />
        <SpaceComponent height={10} />
        <InputComponent
          title=""
          value={email}
          onChange={val => setEmail(val)}
          placeholder="Email"
          prefix={<Sms size={22} color={appColors.gray} />}
          allowClear
          type="email-address"
        />
        <InputComponent
          title=""
          isPassword
          value={password}
          onChange={val => setPassword(val)}
          placeholder="Password"
          prefix={<Lock size={22} color={appColors.gray} />}
        />
        <ButtonComponent
          text="Forgot Password?"
          onPress={() => navigation.navigate('ForgotPassword')}
          type="link"
        />
        {errorText && (
          <TextComponent text={errorText} color={appColors.primary} flex={0} />
        )}

        <SpaceComponent height={20} />
        <ButtonComponent type="primary" text="Login" onPress={handleLogin} />

        <RowComponent styles={{marginTop: 20}}>
          <Text style={[globalStyles.text]}>
            You don't have an account?{' '}
            <Text
              style={{color: appColors.primary}}
              onPress={() => navigation.navigate('SignUpScreen')}>
              Create an account
            </Text>
          </Text>
        </RowComponent>
      </SectionComponent>
    </Container>
  );
};

export default LoginScreen;


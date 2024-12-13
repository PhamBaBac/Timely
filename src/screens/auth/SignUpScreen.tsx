import {Lock, Sms} from 'iconsax-react-native';
import React, {useEffect, useState} from 'react';
import {Image, StatusBar, Text, View} from 'react-native';
import authenticationAPI from '../../apis/authApi';
import {
  ButtonComponent,
  Container,
  InputComponent,
  RowComponent,
  SectionComponent,
  SpaceComponent,
} from '../../components';
import TextComponent from '../../components/TextComponent';
import TitleComponent from '../../components/TitleComponent';
import {appColors, appInfo, fontFamilies} from '../../constants';
import LoadingModal from '../../modal/LoadingModal';
import {globalStyles} from '../../styles/globalStyles';

const SignUpScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (email || password || confirmPassword) {
      setErrorText('');
    }
  }, [email, password, confirmPassword]);

  const handleSigninWithEmail = async () => {
    if (!email || !password || !confirmPassword) {
      setErrorText('Vui lòng nhập email, mật khẩu và xác nhận mật khẩu!!!');
    } else if (
      !email.match(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/g)
    ) {
      setErrorText('Email không hợp lệ!!!');
    } else if (password !== confirmPassword) {
      setErrorText('Mật khẩu không khớp!!!');
    } //Mat khau phai co it nhat 6 ki tu, it nhat 1 chu hoa, 1 chu thuong, 1 so
    
    else if (password.length < 6) {
      setErrorText('Mật khẩu phải có ít nhất 6 kí tự!!!');
    } else {
      const api = `/send-OTP`;
      setIsLoading(true);
      try {
        const res = await authenticationAPI.HandleAuthentication(
          api,
          {email: email},
          'post',
        );
        setIsLoading(false);
        console.log(res.data);

        navigation.navigate('Verification', {
          code: res.data.code,
          email,
          password,
        });
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
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
          }}
        />
      </RowComponent>
      <SpaceComponent height={20} />
      <SectionComponent
        styles={{
          flex: 1,
        }}>
        <TitleComponent
          text="Đăng ký"
          font={fontFamilies.medium}
          size={22}
          flex={0}
        />

        <View style={{marginVertical: 20}}>
          <InputComponent
            value={email}
            onChange={val => setEmail(val)}
            prefix={<Sms size={20} color={appColors.gray} />}
            placeholder="Email"
            title=""
            allowClear
          />
          <InputComponent
            value={password}
            onChange={val => setPassword(val)}
            prefix={<Lock size={20} color={appColors.gray} />}
            placeholder="Mật khẩu"
            title=""
            isPassword
          />
          <InputComponent
            value={confirmPassword}
            onChange={val => setConfirmPassword(val)}
            prefix={<Lock size={20} color={appColors.gray} />}
            placeholder="Nhập lại mật khẩu"
            title=""
            isPassword
          />
          {errorText && (
            <TextComponent
              text={errorText}
              color={appColors.primary}
              flex={0}
            />
          )}
        </View>

        <ButtonComponent
          type="primary"
          text="Đăng ký"
          onPress={handleSigninWithEmail}
        />

        <SpaceComponent height={20} />
        <Text style={[globalStyles.text, {textAlign: 'center'}]}>
          Bạn đã có tài khoản?{' '}
          <Text
            style={{color: appColors.primary}}
            onPress={() => navigation.navigate('LoginScreen')}>
            Đăng nhập ngay
          </Text>
        </Text>
      </SectionComponent>
      <LoadingModal visible={isLoading} />
    </Container>
  );
};

export default SignUpScreen;

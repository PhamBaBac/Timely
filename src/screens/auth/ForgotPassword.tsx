import {useState} from 'react';
import {
  ButtonComponent,
  Container,
  InputComponent,
  SectionComponent,
  SpaceComponent,
  TextComponent,
} from '../../components';
import {ArrowRight, Sms} from 'iconsax-react-native';
import {appColors} from '../../constants';
import LoadingModal from '../../modal/LoadingModal';
import authenticationAPI from '../../apis/authApi';
import {Alert} from 'react-native';
import auth from '@react-native-firebase/auth';

const ForgotPassword = ({navigation} :any) => {
  const [email, setEmail] = useState('');
  const [isDisable, setIsDisable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Password reset email sent.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('LoginScreen'),
          },
        ],
        {cancelable: false},
      );
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert(
        'Error',
        `Error sending password reset email: ${error.message}`,
      );
    }
  };

  return (
    <Container back>
      <SectionComponent>
        <TextComponent text="Reset Password" title />
        <SpaceComponent height={12} />
        <TextComponent text="Please enter your email address to request a password reset" />
        <SpaceComponent height={26} />
        <InputComponent
          value={email}
          onChange={val => setEmail(val)}
          affix={<Sms size={20} color={appColors.gray} />}
          placeholder="abc@gmail.com"
        />
      </SectionComponent>
      <SectionComponent>
        <ButtonComponent
          onPress={handleForgotPassword}
          disable={isDisable}
          text="Send"
          type="primary"
          icon={<ArrowRight size={20} color={appColors.white} />}
          iconFlex="right"
        />
      </SectionComponent>
      <LoadingModal visible={isLoading} />
    </Container>
  );
};

export default ForgotPassword;

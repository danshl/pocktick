import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import AppText from './AppText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import useGoogleLogin from './GoogleSignIn';
import { login } from './api/auth';
import { registerUser } from './api/auth';
import useAppleLogin from './AppleSignIn';

const TitleBar2 = () => (
  <View style={styles.titleBar} />
);

type Group33624Props = {
  selectedTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
};

const Group33624: React.FC<Group33624Props> = ({ selectedTab, onTabChange }) => (
  <View style={styles.tabGroup33624}>
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === 'login' && styles.activeTab]}
      onPress={() => onTabChange('login')}
    >
      <Text style={[styles.tabText, selectedTab === 'login' && styles.activeTabText]}>Log In</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tabButton, selectedTab === 'signup' && styles.activeTab]}
      onPress={() => onTabChange('signup')}
    >
      <Text style={[styles.tabText, selectedTab === 'signup' && styles.activeTabText]}>Sign Up</Text>
    </TouchableOpacity>
  </View>
);

type InputFieldProps = {
  label: string;
  placeholder: string;
  icon: ImageSourcePropType;
  secure?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  showPassword?: boolean;
  onTogglePassword?: () => void;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  icon,
  secure = false,
  value,
  onChangeText,
  showPassword,
  onTogglePassword,
}) => (
  <View style={styles.inputContainer}>
    <View style={styles.labelRow}>
      <Image source={icon} style={styles.labelIcon} />
      <Text style={styles.inputLabel}>{label}</Text>
    </View>
    <View style={styles.inputBox}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secure}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
      {onTogglePassword && (
        <TouchableOpacity onPress={onTogglePassword}>
          <Image
            source={
              showPassword
                ? require('../assets/icons/eye.png')
                : require('../assets/icons/eye-off.png')
            }
            style={styles.inputRightIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

type Frame33377Props = {
  selectedTab: 'login' | 'signup';
  setSelectedTab: (tab: 'login' | 'signup') => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  fullName: string;
  setFullName: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  isLoading: boolean;
  handleLogin: () => void;
  handleSignup: () => void;
  signIn: () => void;
  signInWithApple: () => void;
  router: ReturnType<typeof useRouter>;
  showLoginPassword: boolean;
  setShowLoginPassword: (val: boolean) => void;
  showSignupPassword: boolean;
  setShowSignupPassword: (val: boolean) => void;
  showSignupConfirmPassword: boolean;
  setShowSignupConfirmPassword: (val: boolean) => void;
  error: boolean;
  setError: (val: boolean) => void;
};

const Frame33377: React.FC<Frame33377Props> = ({
  selectedTab,
  setSelectedTab,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  isLoading,
  handleLogin,
  handleSignup,
  signIn,
  signInWithApple,
  router,
  showLoginPassword,
  setShowLoginPassword,
  showSignupPassword,
  setShowSignupPassword,
  showSignupConfirmPassword,
  setShowSignupConfirmPassword,
  error,
  setError,
}) => (
  <View style={styles.frameContent}>
    <Group33624 selectedTab={selectedTab} onTabChange={setSelectedTab} />

    {selectedTab === 'login' ? (
      <>
        <InputField
          label=" Email"
          placeholder="Enter your email"
          icon={require('../assets/icons/Message.png')}
          value={email}
          onChangeText={setEmail}
        />
        <InputField
          label=" Password"
          placeholder="Enter your password"
          secure={!showLoginPassword}
          icon={require('../assets/icons/lock.png')}
          value={password}
          onChangeText={setPassword}
          showPassword={showLoginPassword}
          onTogglePassword={() => setShowLoginPassword(!showLoginPassword)}
        />

        <View style={styles.forgotAndErrorRow}>
          <TouchableOpacity onPress={() => router.push('/ForgotPasswordScreen')}>
            <AppText style={styles.forgotLink}>Forgot Password?</AppText>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>Invalid email or password</Text>}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, isLoading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <AppText style={styles.continueText}>
            {isLoading ? 'Authenticating...' : 'Continue'}
          </AppText>
          <View style={styles.arrowCircle}>
            <Image
              source={require('../assets/icons/next_white.png')}
              style={styles.arrowIcon}
            />
          </View>
        </TouchableOpacity>

        <AppText style={styles.orText}>OR</AppText>
        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.socialButton} onPress={signInWithApple}>
            <Image source={require('../assets/icons/apple.png')} style={styles.socialIcon} />
            <AppText style={styles.socialText}>Login with Apple</AppText>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.socialButton} onPress={signIn}>
          <Image source={require('../assets/icons/google.png')} style={styles.socialIcon} />
          <AppText style={styles.socialText}>Login with Google</AppText>
        </TouchableOpacity>
        <AppText style={styles.bottomText}>
          Don’t have an account? <AppText style={styles.link}>Sign up</AppText>
        </AppText>
      </>
    ) : (
      <>
        <AppText style={styles.createAccountTitle}>Create an account</AppText>
        <InputField
          label=" Full Name"
          placeholder="Enter your full name"
          icon={require('../assets/icons/user.png')}
          value={fullName}
          onChangeText={setFullName}
        />
        <InputField
          label=" Phone Number"
          placeholder="Enter your phone number"
          icon={require('../assets/icons/phone.png')}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <InputField
          label=" Email"
          placeholder="Enter your email"
          icon={require('../assets/icons/Message.png')}
          value={email}
          onChangeText={setEmail}
        />
        <InputField
          label=" Password"
          placeholder="Enter your password"
          secure={true}
          icon={require('../assets/icons/lock.png')}
          value={password}
          onChangeText={setPassword}
        />
        <InputField
          label=" Confirm Password"
          placeholder="Confirm your password"
          secure={true}
          icon={require('../assets/icons/lock.png')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.continueButton} onPress={handleSignup}>
          <AppText style={styles.continueText}>Sign Up</AppText>
          <View style={styles.arrowCircle}>
            <Image
              source={require('../assets/icons/next_white.png')}
              style={styles.arrowIcon}
            />
          </View>
        </TouchableOpacity>
        <AppText style={styles.bottomText}>
          Already have an account? <AppText style={styles.link}>Log Up</AppText>
        </AppText>
      </>
    )}
  </View>
);

export default function LoginScreen() {
  const [selectedTab, setSelectedTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const router = useRouter();
  const { signIn } = useGoogleLogin();
  const { signInWithApple } = useAppleLogin();

const handleLogin = async () => {
  try {
    setError(false);
    setIsLoading(true);

    const result = await login(email, password);
    const token = result.token;

    // שמירה מקומית של הטוקן והאימייל
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userEmail', email);

    // בדיקה האם המשתמש חתם על תנאי השימוש
    const termsRes = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/has-accepted-terms', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!termsRes.ok) {
      throw new Error('Failed to check terms acceptance.');
    }

    const termsData = await termsRes.json();

    if (termsData.hasAccepted) {
      router.replace('/load-screen');
    } else {
      router.replace('/accept-terms');
    }
  } catch (error: any) {
    if (error.status === 401 && error.message?.includes('verify your email')) {
      Alert.alert('Email Not Verified', 'Please verify your email to continue.', [
        { text: 'OK', onPress: () => router.push({ pathname: '/VerifyEmailScreen', params: { email } }) },
      ]);
    } else if (error.status === 400 && error.message?.toLowerCase().includes('too many')) {
      Alert.alert('Too Many Attempts', 'Please try again in 15 minutes.');
    } else {
      console.error('Login error:', error);
      setError(true);
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', "Passwords don't match");
      return;
    }

    try {
      await registerUser({ email, fullName, password, phoneNumber });
      router.push({ pathname: "/VerifyEmailScreen", params: { email } });
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Registration Failed', error.message || 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      <TitleBar2 />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Frame33377
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          fullName={fullName}
          setFullName={setFullName}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          isLoading={isLoading}
          handleLogin={handleLogin}
          handleSignup={handleSignup}
          signIn={signIn}
          signInWithApple={signInWithApple}
          router={router}
          showLoginPassword={showLoginPassword}
          setShowLoginPassword={setShowLoginPassword}
          showSignupPassword={showSignupPassword}
          setShowSignupPassword={setShowSignupPassword}
          showSignupConfirmPassword={showSignupConfirmPassword}
          setShowSignupConfirmPassword={setShowSignupConfirmPassword}
          error={error}
          setError={setError}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  titleBar: {
    height: 80,
    width: 375,
    justifyContent: 'center',
    paddingLeft: 24,
  },
  backButton: {
    width: 22,
    height: 22,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#1D2B64',
    top: 38,
  },
  frameContent: {
    paddingHorizontal: 20,
    gap: 20,
    alignItems: 'center',
  },
  tabGroup33624: {
    width: 295,
    height: 45,
    backgroundColor: '#E9EDFF',
    borderRadius: 100,
    flexDirection: 'row',
    padding: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  tabText: {
    fontSize: 16,
    color: '#1D2B64',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  inputContainer: {
    width: '100%',
  },
  inputBox: {
    width: '100%',
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputLabel: {
    fontSize: 15,
    color: '#1D2B64',
    fontFamily: 'Poppins-Regular',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#1D2B64',
  },
  inputRightIcon: {
    width: 20,
    height: 20,
    tintColor: '#1D2B64',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
    link: {
    color: '#3366FF',
    textDecorationLine: 'underline',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B2B68',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
  },
continueText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 18,
  fontFamily: 'Poppins-SemiBold',
  marginRight: 10, 
},

arrowCircle: {
  backgroundColor: '#354274',
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: 'center',
  alignItems: 'center',
},

arrowIcon: {
  width: 16,
  height: 16,
  tintColor: '#fff',
},

  arrowRight: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  orText: {
    marginVertical: 10,
    fontSize: 14,
    color: '#1D2B64',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    width: 335,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  createAccountTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 10,
    color: '#1D2B64',
    fontFamily: 'Poppins-Bold',
    alignSelf: 'center',
  },
  socialIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    resizeMode: 'contain',
  },
  socialText: {
    fontSize: 16,
    color: '#1D2B64',
  },
  bottomText: {
    fontSize: 14,
    marginTop: 20,
    color: '#1D2B64',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  labelIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: '#1D2B64',
  },
forgotAndErrorRow: {
  flexDirection: 'row-reverse',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: 10,
},

forgotLink: {
  color: '#1D2B64',
  textDecorationLine: 'underline',
  fontFamily: 'Poppins-Regular',
  fontSize: 14,
},

errorText: {
  color: '#FF3B30',
  fontSize: 14,
  fontFamily: 'Poppins-Regular',
  textAlign: 'left',
},
});
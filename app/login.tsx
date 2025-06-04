import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, Platform, StatusBar, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import  useGoogleLogin from './GoogleSignIn';
import { signInWithApple } from './AppleSignIn';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function AuthScreen() {
  const [selectedTab, setSelectedTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  
const { signIn } = useGoogleLogin();


const signInWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const token = credential.identityToken;
    const fullName = "Israel israeli"; 

    if (!token) {
      Alert.alert('שגיאה', 'לא התקבל טוקן מ־Apple');
      return;
    }
    console.log(token,fullName);
    const response = await fetch(
      'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/login-with-apple',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: token,
          fullName: fullName,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      Alert.alert('שגיאה בהתחברות', result.message || 'התחברות נכשלה');
      return;
    }

    await AsyncStorage.setItem('authToken', result.token);
    await AsyncStorage.setItem('userEmail', result.email);
    router.replace('/load-screen');
  } catch (e: any) {
    if (e.code === 'ERR_REQUEST_CANCELED') {
      console.log('ביטול', 'המשתמש ביטל את ההתחברות עם Apple');
    } else {
      Alert.alert('שגיאה בהתחברות', e.message || 'שגיאה לא צפויה');
      console.error('Apple Sign-In Error:', e);
    }
  }
};

  
const handleLogin = async () => {
  try {
    setError(false);
    setIsLoading(true); // התחל טעינה

    const response = await fetch(
      'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    );

    const result = await response.json();
    console.log(result);

    if (!response.ok) {
      if (
        response.status === 401 &&
        result.message === 'Please verify your email before logging in.'
      ) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email to continue.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.push({
                  pathname: '/VerifyEmailScreen',
                  params: { email }
                });
              }
            }
          ]
        );
        return;
      }
      if (
        response.status === 400 &&
        result.message?.toLowerCase().includes('too many failed login attempts')
      ) {
        Alert.alert('Too Many Attempts', 'Please try again in 15 minutes.');
        return;
      }

      setError(true);
      return;
    }

    await AsyncStorage.setItem('authToken', result.token);
    await AsyncStorage.setItem('userEmail', email);
    console.log("s'");
    router.replace('/load-screen');

  } catch (error) {
    console.error('Login error:', error);
    setError(true);
  } finally {
    setIsLoading(false); // סיים טעינה תמיד
  }
};

  
  

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      const response = await fetch('https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullName,
          passwordHash: password,
          PhoneNumber: phoneNumber
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        Alert.alert('Registration Failed', result.message);
        return;
      }

      router.push({
        pathname: "/VerifyEmailScreen",
        params: { email }
      });
    } catch (error) {
      console.error(error);
      alert('An error occurred during registration.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setSelectedTab('login')} style={styles.tab}>
          <Text style={[styles.tabText, selectedTab === 'login' && styles.activeText]}>Log in</Text>
          {selectedTab === 'login' && <View style={styles.activeUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('signup')} style={styles.tab}>
          <Text style={[styles.tabText, selectedTab === 'signup' && styles.activeText]}>Sign up</Text>
          {selectedTab === 'signup' && <View style={styles.activeUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.frameContainer}>
          {selectedTab === 'login' ? (
            <>
              <Text style={styles.label}>Your Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <View style={styles.passwordRow}>
                {error ? <Text style={styles.errorText}>Invalid email or password</Text> : <View style={{ flex: 1 }} />}
                <TouchableOpacity onPress={() => router.push('/ForgotPasswordScreen')}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.continueButton, isLoading && { opacity: 0.6 }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.continueText}>
                  {isLoading ? 'Checking credentials...' : 'Continue'}
                </Text>
              </TouchableOpacity>


              <View style={styles.orContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>Or</Text>
                <View style={styles.line} />
              </View>

              {Platform.OS === 'ios' && (
                <TouchableOpacity style={styles.socialButton} onPress={signInWithApple}>
                  <Image source={require('../assets/images/apple-logo.png')} style={styles.socialIcon} />
                  <Text style={styles.socialText}>Login with Apple</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.socialButton}  onPress={signIn}>
                <Image source={require('../assets/images/google.png')} style={styles.socialIcon} />
                <Text style={styles.socialText}>Login with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setSelectedTab('signup')}>
                <Text style={styles.signupText}>
                  Don't have an account? <Text style={styles.signupLink}>Sign up</Text>
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Create an Account</Text>
              <Text style={styles.subtitle}>Join and enjoy a seamless experience! 🎉</Text>

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              <Text style={styles.label}>Your Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity style={styles.continueButton} onPress={handleSignup}>
                <Text style={styles.continueText}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedTab('login')}>
                <Text style={styles.signupText}>
                  Already have an account? <Text style={styles.signupLink}>Log in</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) - 20 : 60,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
    marginTop: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
  },
  tabText: {
    fontSize: 18,
    color: '#888',
  },
  activeText: {
    color: '#1D2B64',
    fontWeight: 'bold',
  },
  activeUnderline: {
    width: 150,
    height: 2,
    backgroundColor: '#1D2B64',
    marginTop: 4,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  frameContainer: {
    marginTop: 20,
    padding: 20,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    height: 55,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
  },
  inputError: {
    borderColor: 'red',
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 14,

  },
  forgotPasswordText: {
    color: '#1D2B64',
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#1D2B64',
    height: 55,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
    width: '60%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#888',
  },
  socialButton: {
    width: '100%',
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginVertical: 10,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialText: {
    fontSize: 16,
    color: '#333',
  },
  signupText: {
    marginTop: 10,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  signupLink: {
    color: '#1D2B64',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
    top: -10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    top: -10,
  },
});
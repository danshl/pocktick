import { Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function useAppleLogin() {
  const router = useRouter();

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const token = credential.identityToken;
      const fullName = 'Israel Israeli';

      if (!token) {
        Alert.alert('Error', 'No token was received from Apple.');
        return;
      }

      const response = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/login-with-apple',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: token, fullName }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        Alert.alert('Error', result.message || 'Please try again later.');
        return;
      }

      await AsyncStorage.setItem('authToken', result.token);
      await AsyncStorage.setItem('userEmail', result.email);
      router.replace('/load-screen');
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // Silent cancel
        return;
      }

      Alert.alert('Sign-In Error', e.message || 'An unexpected error occurred.');
      console.error('Apple Sign-In Error:', e);
    }
  };

  return { signInWithApple };
}

import { Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { handleToken } from './tokenUtils';

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
      const fullName = 'Israel Israeli'; // אתה יכול לשלוף מהcredential אם תרצה

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

      handleToken(result.token,result.email);


      // ✅ בדיקה אם המשתמש חתם על תנאי השימוש
      const termsRes = await fetch(
        'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/users/has-accepted-terms',
        {
          headers: {
            Authorization: `Bearer ${result.token}`,
          },
        }
      );

      const termsData = await termsRes.json();

      if (!termsRes.ok) {
        Alert.alert('Error', 'Failed to verify terms acceptance.');
        return;
      }

      if (termsData.hasAccepted) {
        router.replace('/load-screen');
      } else {
        router.replace('/accept-terms');
      }
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
import { GoogleSignin, statusCodes, SignInResponse, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

GoogleSignin.configure({
  webClientId: '1087486296114-p6rqrktpn5o4n487bpgm7gv8otco82tr.apps.googleusercontent.com',
  offlineAccess: true,
});

export default function useGoogleLogin() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<SignInResponse | null>(null);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        console.log(idToken);
        // בקשת התחברות לשרת עם הטוקן מ-Google
        const apiResponse = await fetch(
          'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/login-with-google',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ AccessToken: idToken })
          }
        );

        const result = await apiResponse.json();
        console.log(result);
        if (!apiResponse.ok) {
          console.error('Server rejected the token:', result.message);
          return;
        }

        // שמור את ה-JWT שהשרת מחזיר
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userEmail', result.email);

        router.replace('/(tabs)/my-tickets');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Login already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play Services not available.');
      } else {
        console.error('Unknown error during Google Sign-In', error);
      }
    }
  };

  return { signIn, userInfo };
}
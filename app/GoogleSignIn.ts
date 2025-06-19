import { GoogleSignin, statusCodes, SignInResponse, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

GoogleSignin.configure({
  webClientId: '1087486296114-p6rqrktpn5o4n487bpgm7gv8otco82tr.apps.googleusercontent.com',
  offlineAccess: true,
  iosClientId: '1087486296114-8rtveh0oga5ni88hc3925vbiu4j2nb36.apps.googleusercontent.com',
});

export default function useGoogleLogin() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<SignInResponse | null>(null);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;

        const apiResponse = await fetch(
          'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/login-with-google',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ AccessToken: idToken }),
          }
        );

        const result = await apiResponse.json();

        if (!apiResponse.ok) {
          Alert.alert('Error', result.message || 'Please try again later.');
          return;
        }

        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userEmail', result.email);
        router.replace('/load-screen');
      }
    } catch (error: any) {
      let errorMsg = 'An unknown error occurred.';

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMsg = 'Sign-in was cancelled by the user.';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMsg = 'A sign-in operation is already in progress.';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMsg = 'Google Play Services are not available.';
      }

      Alert.alert('Google Sign-In Error', errorMsg);
    }
  };

  return { signIn, userInfo };
}

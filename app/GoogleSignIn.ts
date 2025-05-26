import { GoogleSignin, statusCodes, SignInResponse, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

GoogleSignin.configure({
  webClientId: '1087486296114-p6rqrktpn5o4n487bpgm7gv8otco82tr.apps.googleusercontent.com',
  offlineAccess: true,
  iosClientId:'1087486296114-8rtveh0oga5ni88hc3925vbiu4j2nb36.apps.googleusercontent.com',
});

export default function useGoogleLogin() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<SignInResponse | null>(null);

  const signIn = async () => {
    try {
      console.log("a");
      await GoogleSignin.hasPlayServices();
      console.log("b");
      await GoogleSignin.signOut();
      const response = await GoogleSignin.signIn();
      console.log("c");
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        console.log(idToken);
        const apiResponse = await fetch(
          'https://ticket-exchange-backend-gqdvcdcdasdtgccf.israelcentral-01.azurewebsites.net/api/auth/login-with-google',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ AccessToken: idToken })
          }
        );

        const result = await apiResponse.json();

        if (!apiResponse.ok) {
          Alert.alert('שגיאה בהתחברות', result.message || 'השרת דחה את ההתחברות');
          return;
        }

        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userEmail', result.email);

        Alert.alert('התחברת בהצלחה', `ברוך הבא, ${result.name || 'משתמש'}`);
        router.replace('/(tabs)/my-tickets');
      }
    } catch (error: any) {
      let errorMsg = 'שגיאה לא ידועה התרחשה';

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMsg = 'המשתמש ביטל את ההתחברות';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMsg = 'תהליך התחברות כבר מתבצע';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMsg = 'Google Play Services לא זמינים';
      }

      Alert.alert('שגיאה בהתחברות', errorMsg);
      Alert.alert('Google Sign-In Error:', error);
    }
  };

  return { signIn, userInfo };
}
